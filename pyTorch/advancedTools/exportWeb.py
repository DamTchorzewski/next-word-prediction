"""
Export the trained next-word models for the browser demo in web/.

For every corpus that has both a trained model (pyTorch/path/*.pth) and a vocabulary file (wordPairs/vocab_*.txt):
- model.onnx: the ComplexRNN graph (opset 17; batch and window length are dynamic, so a text shorter than the window still runs) with weight-only int8 quantisation: every large
  weight is stored as int8 with a per-row scale and turned back into float32 by a DequantizeLinear node, so every
  operator still computes in float32 (onnxruntime-web has no int8 LSTM kernel),
- vocab.json: the tokens in index order,
- forms.json: how a whitespace-separated word of the cleaned text becomes model tokens (NLTK word_tokenize, then the
  WordNet lemmatiser), for every word of the corpus where that is not the word itself,
- meta.json: window, vocabulary size, file size and the top-1 / top-5 measured on the saved test split.

Run from the repository root with torch, onnx, onnxruntime, nltk and numpy installed:
    python pyTorch/advancedTools/exportWeb.py
"""

import json
import os
import re
import string
import sys

import numpy as np
import onnx
import onnxruntime as ort
import torch
from onnx import helper, numpy_helper, TensorProto

import nltk
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from rnnModel import ComplexRNN  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "web", "public", "models")

# id, corpus file in base/, window; the .pth and vocab names follow predictionModel.py and wordPreprocessing.py
CORPORA = [
    ("sentences", "generate_sentense.txt", 5),
    ("stories", "sherlock_holm_stories_plain.txt", 10),
    ("emotions", "emotion_final.csv", 10),
]
EMBEDDING_DIM = 256
HIDDEN_SIZE = 256
QUANTISE_MIN_ELEMENTS = 4096


def load_vocab(path):
    vocab = {}
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if ": " in line:
                token, idx = line.strip().split(": ", 1)
                vocab[token] = int(idx)
    tokens = [None] * len(vocab)
    for token, idx in vocab.items():
        tokens[idx] = token
    assert all(t is not None for t in tokens), "vocabulary indices are not contiguous"
    return vocab, tokens


def clean(text):
    # the same as remove_numbers_and_special_chars in wordPreprocessing.py
    return re.sub(r"[\d" + re.escape(string.punctuation) + "]", "", text)


def build_forms(corpus_path, vocab, lemmatizer):
    """Map each cleaned, whitespace-separated word to the tokens training produced for it, when they differ."""
    with open(corpus_path, "r", encoding="utf-8") as f:
        text = f.read()
    forms = {}
    for word in set(clean(text).split()):
        tokens = [lemmatizer.lemmatize(t) for t in word_tokenize(word)]
        if tokens != [word] and all(t in vocab for t in tokens):
            forms[word] = tokens
    return dict(sorted(forms.items()))


def load_test(path):
    xs, ys = [], []
    pattern = re.compile(r"Input Sequence: \[([\d, ]+)\], Output Word: (\d+)")
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            m = pattern.match(line.strip())
            if m:
                xs.append([int(i) for i in m.group(1).split(",")])
                ys.append(int(m.group(2)))
    return np.array(xs, dtype=np.int64), np.array(ys, dtype=np.int64)


def quantise_weights(model):
    """Replace large float initialisers with int8 + per-row scale + DequantizeLinear (weight-only quantisation)."""
    graph = model.graph
    keep, nodes = [], []
    for init in graph.initializer:
        w = numpy_helper.to_array(init)
        if w.dtype != np.float32 or w.size < QUANTISE_MIN_ELEMENTS or w.ndim < 2:
            keep.append(init)
            continue
        # per-row scale along the second-to-last axis folded into the first axes: flatten to rows x columns
        axis = w.ndim - 2
        reduce_axes = tuple(i for i in range(w.ndim) if i != axis)
        scale = np.max(np.abs(w), axis=reduce_axes) / 127.0
        scale[scale == 0] = 1.0
        shape = [1] * w.ndim
        shape[axis] = -1
        q = np.clip(np.round(w / scale.reshape(shape)), -127, 127).astype(np.int8)
        name = init.name
        keep.append(numpy_helper.from_array(q, name + "_q"))
        keep.append(numpy_helper.from_array(scale.astype(np.float32), name + "_scale"))
        keep.append(numpy_helper.from_array(np.zeros(scale.shape, dtype=np.int8), name + "_zero"))
        nodes.append(
            helper.make_node(
                "DequantizeLinear", [name + "_q", name + "_scale", name + "_zero"], [name], axis=axis, name=name + "_dq"
            )
        )
    del graph.initializer[:]
    graph.initializer.extend(keep)
    old = list(graph.node)
    del graph.node[:]
    graph.node.extend(nodes + old)
    return model


def evaluate(session, xs, ys, batch=512):
    top1 = top5 = 0
    for i in range(0, len(xs), batch):
        logits = session.run(None, {"tokens": xs[i : i + batch]})[0]
        best = np.argsort(-logits, axis=1)[:, :5]
        top1 += int(np.sum(best[:, 0] == ys[i : i + batch]))
        top5 += int(np.sum(np.any(best == ys[i : i + batch, None], axis=1)))
    return top1 / len(xs), top5 / len(xs)


def export(corpus_id, corpus_file, window, lemmatizer):
    stem = re.sub(r"\.(txt|csv)$", "", corpus_file)
    vocab_path = os.path.join(HERE, "wordPairs", f"vocab_{stem}_sequence_length_{window}.txt")
    test_path = os.path.join(HERE, "wordPairs", f"output_word_pairs_{stem}_sequence_length_{window}_test.txt")
    pth_path = os.path.join(ROOT, "pyTorch", "path", f"rnn_model_{corpus_file}_{window}.pth")
    vocab, tokens = load_vocab(vocab_path)

    net = ComplexRNN(len(tokens), EMBEDDING_DIM, HIDDEN_SIZE, len(tokens))
    net.load_state_dict(torch.load(pth_path, map_location="cpu"))
    net.eval()

    out_dir = os.path.join(OUT, corpus_id)
    os.makedirs(out_dir, exist_ok=True)
    fp32_path = os.path.join(out_dir, "model.fp32.onnx")
    torch.onnx.export(
        net,
        torch.zeros(1, window, dtype=torch.long),
        fp32_path,
        input_names=["tokens"],
        output_names=["logits"],
        dynamic_axes={"tokens": {0: "batch", 1: "words"}, "logits": {0: "batch"}},
        opset_version=17,
        dynamo=False,
    )
    model = quantise_weights(onnx.load(fp32_path))
    onnx.checker.check_model(model)
    model_path = os.path.join(out_dir, "model.onnx")
    onnx.save(model, model_path)

    xs, ys = load_test(test_path)
    fp32 = ort.InferenceSession(fp32_path, providers=["CPUExecutionProvider"])
    int8 = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
    fp32_top1, fp32_top5 = evaluate(fp32, xs, ys)
    top1, top5 = evaluate(int8, xs, ys)

    # the int8 graph must rank like the PyTorch weights on a sample of the test windows
    sample = xs[:256]
    with torch.no_grad():
        ref = net(torch.from_numpy(sample)).numpy()
    got = int8.run(None, {"tokens": sample})[0]
    agree = float(np.mean(np.argmax(ref, 1) == np.argmax(got, 1)))

    fp32_size = os.path.getsize(fp32_path)
    os.remove(fp32_path)

    forms = build_forms(os.path.join(HERE, "base", corpus_file), vocab, lemmatizer)
    with open(os.path.join(out_dir, "vocab.json"), "w", encoding="utf-8") as f:
        json.dump(tokens, f, ensure_ascii=False, separators=(",", ":"))
    with open(os.path.join(out_dir, "forms.json"), "w", encoding="utf-8") as f:
        json.dump(forms, f, ensure_ascii=False, separators=(",", ":"))
    meta = {
        "id": corpus_id,
        "corpus": corpus_file,
        "window": window,
        "vocabSize": len(tokens),
        "modelBytes": os.path.getsize(model_path),
        "fp32Bytes": fp32_size,
        "testWindows": int(len(xs)),
        "top1": round(top1, 4),
        "top5": round(top5, 4),
        "fp32Top1": round(fp32_top1, 4),
        "fp32Top5": round(fp32_top5, 4),
        "top1AgreementWithPyTorch": round(agree, 4),
        "forms": len(forms),
    }
    with open(os.path.join(out_dir, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
        f.write("\n")
    print(json.dumps(meta))
    return meta


def main():
    for resource in ("punkt", "punkt_tab", "wordnet", "omw-1.4"):
        nltk.download(resource, quiet=True)
    lemmatizer = WordNetLemmatizer()
    metas = [export(*c, lemmatizer) for c in CORPORA]
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(metas, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
