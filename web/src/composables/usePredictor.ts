import { computed, reactive, ref, shallowRef, watch } from "vue";
import { corpora, type Corpus } from "../lib/corpora";
import type { Predictor } from "../lib/model";
import {
  buildContext,
  choose,
  insertWord,
  makeVocabulary,
  topK,
  type Forms,
  type Suggestion,
  type Vocabulary,
} from "../lib/preprocess";

type Status = "idle" | "loading" | "ready" | "error";

interface Loaded {
  predictor: Predictor;
  vocab: Vocabulary;
}

const BASE = import.meta.env.BASE_URL;

export function usePredictor() {
  const corpusId = ref<string>(corpora[0]?.id ?? "sentences");
  const corpus = computed<Corpus>(
    () => corpora.find((c) => c.id === corpusId.value) ?? (corpora[0] as Corpus),
  );
  const text = ref("");
  const k = ref(5);
  const status = reactive<Record<string, Status>>({});
  const progress = reactive<Record<string, number>>({});
  const error = ref("");
  const suggestions = shallowRef<Suggestion[]>([]);
  const latency = ref<number | null>(null);
  const busy = ref(false);
  const loaded = new Map<string, Loaded>();
  const pending = new Map<string, Promise<Loaded>>();

  const vocab = shallowRef<Vocabulary | null>(null);
  const context = computed(() =>
    vocab.value ? buildContext(text.value, vocab.value, corpus.value.window) : null,
  );

  async function load(c: Corpus): Promise<Loaded> {
    const done = loaded.get(c.id);
    if (done) return done;
    const running = pending.get(c.id);
    if (running) return running;
    const job = (async () => {
      status[c.id] = "loading";
      progress[c.id] = 0;
      try {
        const dir = `${BASE}models/${c.id}/`;
        const [{ download, createPredictor }, tokens, forms] = await Promise.all([
          import("../lib/model"),
          fetch(`${dir}vocab.json`).then((r) => r.json() as Promise<string[]>),
          fetch(`${dir}forms.json`).then((r) => r.json() as Promise<Forms>),
        ]);
        const bytes = await download(`${dir}model.onnx`, c.modelBytes, (got, total) => {
          progress[c.id] = got / total;
        });
        const predictor = await createPredictor(bytes);
        const result = { predictor, vocab: makeVocabulary(tokens, forms) };
        loaded.set(c.id, result);
        status[c.id] = "ready";
        return result;
      } catch (e) {
        status[c.id] = "error";
        throw e;
      } finally {
        pending.delete(c.id);
      }
    })();
    pending.set(c.id, job);
    return job;
  }

  let ticket = 0;
  async function predict() {
    const c = corpus.value;
    const mine = ++ticket;
    try {
      const m = await load(c);
      if (mine !== ticket) return;
      vocab.value = m.vocab;
      const ctx = buildContext(text.value, m.vocab, c.window);
      if (ctx.window.length === 0) {
        suggestions.value = [];
        latency.value = null;
        return;
      }
      const started = performance.now();
      const logits = await m.predictor.run(ctx.window.map((t) => t.id as number));
      if (mine !== ticket) return;
      latency.value = performance.now() - started;
      suggestions.value = topK(logits, m.vocab.tokens, k.value, ctx.prefix);
      error.value = "";
    } catch (e) {
      if (mine !== ticket) return;
      error.value = e instanceof Error ? e.message : String(e);
      suggestions.value = [];
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(predict, 60);
  }

  // the first model is loaded only once the user shows interest (focus, an example, the button)
  const started = ref(false);
  function start() {
    if (started.value) return;
    started.value = true;
    void predict();
  }

  watch([text, k], () => started.value && schedule());
  watch(corpusId, () => {
    vocab.value = loaded.get(corpusId.value)?.vocab ?? null;
    suggestions.value = [];
    if (started.value) void predict();
  });

  function accept(s: Suggestion) {
    text.value = insertWord(text.value, s.token, context.value?.prefix ?? "");
  }

  /** Append up to `words` predictions, one model run per word. */
  async function complete(words: number, mode: "greedy" | "sample") {
    if (busy.value) return;
    busy.value = true;
    started.value = true;
    try {
      const c = corpus.value;
      const m = await load(c);
      vocab.value = m.vocab;
      let current = text.value;
      for (let i = 0; i < words; i++) {
        const ctx = buildContext(current, m.vocab, c.window);
        if (ctx.window.length === 0) break;
        const logits = await m.predictor.run(ctx.window.map((t) => t.id as number));
        const pick = choose(topK(logits, m.vocab.tokens, 5, ctx.prefix), mode);
        if (!pick) break;
        current = insertWord(current, pick.token, ctx.prefix);
        text.value = current;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
    } finally {
      busy.value = false;
    }
  }

  return {
    corpora,
    corpusId,
    corpus,
    text,
    k,
    status,
    progress,
    error,
    suggestions,
    latency,
    busy,
    context,
    started,
    start,
    accept,
    complete,
    retry: () => {
      error.value = "";
      void predict();
    },
  };
}

export type PredictorState = ReturnType<typeof usePredictor>;
