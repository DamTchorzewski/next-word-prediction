<script setup lang="ts">
import DemoPanel from "./components/DemoPanel.vue";
import HowItWorks from "./components/HowItWorks.vue";
import ModelTable from "./components/ModelTable.vue";
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
import { usePredictor } from "./composables/usePredictor";

const p = usePredictor();
</script>

<template>
  <a
    href="#demo"
    class="sr-only z-50 rounded-full bg-[var(--ink)] px-4 py-2 text-[var(--paper)] focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >Skip to the demo</a
  >
  <SiteHeader />
  <main id="top">
    <div class="relative overflow-hidden">
      <div class="ruled pointer-events-none absolute inset-0" aria-hidden="true" />
      <div class="relative mx-auto max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:pt-24">
        <p class="eyebrow">PyTorch · bidirectional LSTM · ONNX in the browser</p>
        <h1
          class="mt-4 max-w-4xl font-display text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.025em] text-balance sm:text-6xl lg:text-7xl"
        >
          Type a few words.
          <span class="text-[var(--ember)] italic">The network guesses the next one.</span>
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
          A two-layer bidirectional LSTM, trained on three small English corpora, reads the last 5
          or 10 words and ranks every word it knows. It runs on your device with WebAssembly: no
          server, no account, nothing you type leaves the page.
        </p>
      </div>
    </div>

    <div class="mx-auto flex max-w-6xl flex-col gap-20 px-4 pb-24 sm:px-6 lg:gap-28">
      <DemoPanel :p="p" />
      <HowItWorks :corpus="p.corpus.value" />
      <ModelTable :corpora="p.corpora" />
    </div>
  </main>
  <SiteFooter />
</template>
