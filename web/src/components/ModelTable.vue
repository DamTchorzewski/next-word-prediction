<script setup lang="ts">
import { formatBytes, formatPercent, type Corpus } from "../lib/corpora";

defineProps<{ corpora: Corpus[] }>();
</script>

<template>
  <section id="models" aria-labelledby="models-title" class="scroll-mt-24">
    <p class="eyebrow">Models</p>
    <h2
      id="models-title"
      class="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
    >
      Three corpora, measured
    </h2>
    <p class="mt-3 max-w-3xl text-[var(--muted)]">
      Accuracy is measured by the export script on each corpus's saved test split (10% of the
      windows). Those windows overlap with the training windows, because both were cut from the same
      running text, so the figures are optimistic: read them as a comparison between the models, not
      as accuracy on new text.
    </p>
    <div
      class="surface mt-6 overflow-x-auto"
      role="region"
      aria-label="Model comparison table, scrolls sideways on small screens"
      tabindex="0"
    >
      <table class="w-full min-w-[40rem] text-left text-sm">
        <caption class="sr-only">
          Size and measured accuracy of each model
        </caption>
        <thead class="eyebrow border-b border-[var(--line)]">
          <tr>
            <th scope="col" class="px-5 py-3 font-normal">Model</th>
            <th scope="col" class="px-5 py-3 font-normal">Window</th>
            <th scope="col" class="px-5 py-3 font-normal">Vocabulary</th>
            <th scope="col" class="px-5 py-3 font-normal">Download</th>
            <th scope="col" class="px-5 py-3 font-normal">Test windows</th>
            <th scope="col" class="px-5 py-3 font-normal">Top-1</th>
            <th scope="col" class="px-5 py-3 font-normal">Top-5</th>
          </tr>
        </thead>
        <tbody class="font-mono tabular-nums">
          <tr v-for="c in corpora" :key="c.id" class="border-b border-[var(--line)] last:border-0">
            <th scope="row" class="px-5 py-3.5 font-sans text-base font-semibold">{{ c.label }}</th>
            <td class="px-5 py-3.5">{{ c.window }} words</td>
            <td class="px-5 py-3.5">{{ c.vocabSize.toLocaleString("en") }}</td>
            <td class="px-5 py-3.5">
              {{ formatBytes(c.modelBytes) }}
              <span class="text-[var(--muted)]">(float32 {{ formatBytes(c.fp32Bytes) }})</span>
            </td>
            <td class="px-5 py-3.5">{{ c.testWindows.toLocaleString("en") }}</td>
            <td class="px-5 py-3.5">{{ formatPercent(c.top1, 1) }}</td>
            <td class="px-5 py-3.5">{{ formatPercent(c.top5, 1) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-sm text-[var(--muted)]">
      The int8 files score within 0.2 points of the float32 export on every split. The runtime
      itself (ONNX Runtime Web, WebAssembly) is a one-time download of about 15 MB, 4 MB compressed,
      shared by all three models.
    </p>
  </section>
</template>
