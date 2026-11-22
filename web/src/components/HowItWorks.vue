<script setup lang="ts">
import { computed } from "vue";
import type { Corpus } from "../lib/corpora";

const props = defineProps<{ corpus: Corpus }>();

const steps = [
  {
    title: "Clean",
    body: "Digits and ASCII punctuation are removed, exactly as the training script did, so “don't” becomes “dont”.",
  },
  {
    title: "Tokenise and lemmatise",
    body: "Training ran NLTK's word_tokenize and the WordNet lemmatiser. Here a map built from the same corpus replays it: “dreams” → “dream”, “cannot” → “can not”.",
  },
  {
    title: "Window",
    body: "The last known tokens become vocabulary indices. Words the model never saw are skipped and shown as such.",
  },
  {
    title: "Predict",
    body: "ONNX Runtime Web runs the network in WebAssembly; a softmax over every word of the vocabulary gives the probabilities.",
  },
];

const layers = computed(() => [
  { name: "Embedding", detail: `${props.corpus.vocabSize.toLocaleString("en")} × 256` },
  { name: "BiLSTM × 2", detail: "256 per direction" },
  { name: "LayerNorm", detail: "512, last step" },
  { name: "Linear + ReLU", detail: "512 → 256" },
  { name: "Linear", detail: `256 → ${props.corpus.vocabSize.toLocaleString("en")}` },
]);
</script>

<template>
  <section id="how" aria-labelledby="how-title" class="scroll-mt-24">
    <p class="eyebrow">How it works</p>
    <h2
      id="how-title"
      class="mt-1 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl"
    >
      The same pipeline as training, rebuilt for the browser
    </h2>
    <ol class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="(s, i) in steps" :key="s.title" class="surface flex flex-col gap-2 p-5">
        <span class="font-mono text-xs text-[var(--ember)]">0{{ i + 1 }}</span>
        <h3 class="font-display text-xl font-semibold">{{ s.title }}</h3>
        <p class="text-sm leading-relaxed text-[var(--muted)]">{{ s.body }}</p>
      </li>
    </ol>

    <figure class="surface mt-6 p-5 sm:p-6">
      <figcaption class="eyebrow mb-4">ComplexRNN · {{ corpus.label }} model</figcaption>
      <ol class="flex flex-col gap-2 md:flex-row md:items-stretch">
        <li
          v-for="(l, i) in layers"
          :key="l.name"
          class="flex flex-1 items-center gap-2 md:flex-col md:items-stretch"
        >
          <div
            class="flex-1 rounded-xl border border-[var(--line)] px-3 py-2.5"
            :class="i === 1 ? 'bg-[var(--ember-soft)] border-[var(--ember)]' : 'bg-[var(--paper)]'"
          >
            <div class="text-sm font-semibold">{{ l.name }}</div>
            <div class="font-mono text-xs text-[var(--muted)]">{{ l.detail }}</div>
          </div>
        </li>
      </ol>
      <p class="mt-4 text-sm text-[var(--muted)]">
        Trained in PyTorch on windows of {{ corpus.window }} words. For the web the weights are
        stored as int8 with one scale per row and turned back into float32 before every operation,
        which keeps the arithmetic of the original network at a quarter of the download.
      </p>
    </figure>
  </section>
</template>
