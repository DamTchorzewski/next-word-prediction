// onnxruntime-web, loaded only when the first model is needed (this module is imported dynamically).
// The wasm build runs single-threaded: GitHub Pages cannot send the headers that shared memory needs.
import * as ort from "onnxruntime-web/wasm";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";

ort.env.wasm.wasmPaths = { wasm: wasmUrl };
ort.env.wasm.numThreads = 1;
ort.env.logLevel = "error";

export type Progress = (loaded: number, total: number) => void;

/** Download a file and report progress; `expected` is used when the server sends no Content-Length. */
export async function download(
  url: string,
  expected: number,
  onProgress: Progress,
): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`${url}: HTTP ${response.status}`);
  const header = Number(response.headers.get("content-length"));
  const total = header > 0 ? header : expected;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, Math.max(total, loaded));
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

export interface Predictor {
  /** logits over the vocabulary for one window of token ids */
  run(ids: number[]): Promise<Float32Array>;
}

export async function createPredictor(bytes: Uint8Array): Promise<Predictor> {
  const session = await ort.InferenceSession.create(bytes, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
  return {
    async run(ids) {
      const tokens = new ort.Tensor(
        "int64",
        BigInt64Array.from(ids, (id) => BigInt(id)),
        [1, ids.length],
      );
      const output = await session.run({ tokens });
      const logits = output.logits;
      if (!logits) throw new Error("the model returned no logits");
      return logits.data as Float32Array;
    },
  };
}
