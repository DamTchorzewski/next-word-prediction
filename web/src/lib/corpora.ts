import index from "../../public/models/index.json";

/** Written by pyTorch/advancedTools/exportWeb.py; all figures are measured there. */
export interface ModelMeta {
  id: string;
  corpus: string;
  window: number;
  vocabSize: number;
  modelBytes: number;
  fp32Bytes: number;
  testWindows: number;
  top1: number;
  top5: number;
  fp32Top1: number;
  fp32Top5: number;
  top1AgreementWithPyTorch: number;
  forms: number;
}

export interface Corpus extends ModelMeta {
  label: string;
  blurb: string;
  examples: string[];
}

const copy: Record<string, Pick<Corpus, "label" | "blurb" | "examples">> = {
  sentences: {
    label: "Sentences",
    blurb: "Short motivational sentences with a small vocabulary.",
    examples: ["Embrace the", "Find peace in the", "Let your dreams"],
  },
  stories: {
    label: "Stories",
    blurb: "Sherlock Holmes stories: Victorian prose, names, dialogue in curly quotes.",
    examples: ["I had seen little of", "Holmes looked at me with", "It was a dark"],
  },
  emotions: {
    label: "Emotions",
    blurb: "Lower-case lines of an emotion data set, mostly “i feel …”.",
    examples: ["i feel so", "i am feeling", "i didnt want to"],
  },
};

export const corpora: Corpus[] = (index as ModelMeta[]).map((meta) => ({
  ...meta,
  ...(copy[meta.id] ?? { label: meta.id, blurb: meta.corpus, examples: [] }),
}));

export function formatBytes(bytes: number): string {
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`;
}
