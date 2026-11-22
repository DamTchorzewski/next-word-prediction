<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PredictorState } from "../composables/usePredictor";
import { formatBytes } from "../lib/corpora";
import CorpusPicker from "./CorpusPicker.vue";
import SuggestionList from "./SuggestionList.vue";
import WindowView from "./WindowView.vue";

const props = defineProps<{ p: PredictorState }>();
const p = props.p;

const input = ref<HTMLTextAreaElement | null>(null);
const mode = ref<"greedy" | "sample">("greedy");
const words = ref(8);

const state = computed(() => p.status[p.corpusId.value]);
const percent = computed(() => Math.round((p.progress[p.corpusId.value] ?? 0) * 100));

function pick(i: number) {
  const s = p.suggestions.value[i];
  if (!s) return;
  p.accept(s);
  input.value?.focus();
}

function onKeydown(e: KeyboardEvent) {
  if (!e.altKey || e.ctrlKey || e.metaKey) return;
  const n = Number(e.key);
  if (n >= 1 && n <= 9) {
    e.preventDefault();
    pick(n - 1);
  }
}

function useExample(example: string) {
  p.text.value = `${example} `;
  p.start();
  input.value?.focus();
}

// one short announcement per update, not one per chip
const announcement = ref("");
watch(p.suggestions, (list) => {
  announcement.value = list.length ? `${list.length} suggestions, first: ${list[0]?.token}` : "";
});
</script>

<template>
  <section id="demo" aria-labelledby="demo-title" class="surface scroll-mt-24 p-4 sm:p-6 lg:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="eyebrow">Live demo</p>
        <h2
          id="demo-title"
          class="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Start a sentence
        </h2>
      </div>
      <p class="font-mono text-xs text-[var(--muted)]" aria-live="off">
        <template v-if="p.latency.value !== null"
          >inference {{ p.latency.value.toFixed(1) }} ms · wasm, 1 thread</template
        >
        <template v-else>runs on this device · nothing is sent</template>
      </p>
    </div>

    <CorpusPicker
      v-model="p.corpusId.value"
      :corpora="p.corpora"
      :status="p.status"
      :progress="p.progress"
    />
    <p class="mt-2 text-sm text-[var(--muted)]">{{ p.corpus.value.blurb }}</p>

    <div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
      <div class="flex min-w-0 flex-col gap-4">
        <div>
          <label for="prompt" class="eyebrow">Your text</label>
          <textarea
            id="prompt"
            ref="input"
            v-model="p.text.value"
            rows="3"
            spellcheck="false"
            autocomplete="off"
            aria-describedby="prompt-hint"
            :placeholder="`${p.corpus.value.examples[0] ?? 'Type here'}…`"
            class="mt-2 block w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-3 font-display text-xl leading-relaxed placeholder:text-[var(--muted)]/70 focus:border-[var(--ember)] focus:outline-none focus-visible:outline-3 focus-visible:outline-[var(--ember)] sm:text-2xl"
            @focus="p.start()"
            @keydown="onKeydown"
          />
          <p id="prompt-hint" class="mt-2 text-sm text-[var(--muted)]">
            Pick a suggestion or press
            <kbd class="rounded border border-[var(--line)] px-1 font-mono text-xs">Alt</kbd> +
            <kbd class="rounded border border-[var(--line)] px-1 font-mono text-xs">1</kbd>…<kbd
              class="rounded border border-[var(--line)] px-1 font-mono text-xs"
              >{{ p.k.value }}</kbd
            >. Words are case-sensitive, as in training.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-[var(--muted)]">Try:</span>
          <button
            v-for="ex in p.corpus.value.examples"
            :key="ex"
            type="button"
            class="min-h-11 rounded-full border border-dashed border-[var(--line)] px-3.5 text-sm transition-colors hover:border-[var(--ember)] hover:text-[var(--ember)]"
            @click="useExample(ex)"
          >
            {{ ex }}…
          </button>
        </div>

        <div class="min-h-28 rounded-2xl bg-[var(--paper)] p-4" aria-busy="false">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h3 class="eyebrow">Next word</h3>
            <label class="flex items-center gap-2 text-sm text-[var(--muted)]">
              Show
              <select
                v-model.number="p.k.value"
                class="h-9 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 font-mono text-sm text-[var(--ink)]"
              >
                <option v-for="n in [3, 5, 8]" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
          </div>

          <div v-if="state === 'loading'" class="flex flex-col gap-2" role="status">
            <span class="text-sm">
              Downloading the {{ p.corpus.value.label }} model ({{
                formatBytes(p.corpus.value.modelBytes)
              }}) · {{ percent }}%
            </span>
            <span
              class="block h-1.5 overflow-hidden rounded-full bg-[var(--line)]"
              aria-hidden="true"
            >
              <span
                class="block h-full rounded-full bg-[var(--ember)] transition-[width]"
                :style="{ width: `${percent}%` }"
              />
            </span>
          </div>
          <div
            v-else-if="p.error.value"
            role="alert"
            class="flex flex-wrap items-center gap-3 text-sm"
          >
            <span>The model could not run: {{ p.error.value }}</span>
            <button
              type="button"
              class="min-h-11 rounded-full border border-[var(--ink)] px-4 font-medium"
              @click="p.retry()"
            >
              Try again
            </button>
          </div>
          <SuggestionList
            v-else-if="p.suggestions.value.length"
            :suggestions="p.suggestions.value"
            :prefix="p.context.value?.prefix ?? ''"
            @pick="(s) => pick(p.suggestions.value.indexOf(s))"
          />
          <p v-else-if="!p.started.value" class="text-sm text-[var(--muted)]">
            Suggestions appear here. The model ({{ formatBytes(p.corpus.value.modelBytes) }}) and
            the runtime download once you click into the text or pick an example.
          </p>
          <p v-else-if="p.context.value?.prefix" class="text-sm text-[var(--muted)]">
            No word in this vocabulary starts with “{{ p.context.value.prefix }}”.
          </p>
          <p v-else class="text-sm text-[var(--muted)]">
            Type a word this model knows to see what comes next.
          </p>
          <p class="sr-only" aria-live="polite">{{ announcement }}</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-5 font-medium text-[var(--paper)] transition-opacity hover:opacity-90 disabled:opacity-50"
            :disabled="p.busy.value"
            @click="p.complete(words, mode)"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            {{ p.busy.value ? "Writing…" : `Complete ${words} words` }}
          </button>
          <fieldset class="flex items-center rounded-full border border-[var(--line)] p-1 text-sm">
            <legend class="sr-only">How to pick each word</legend>
            <label
              v-for="m in ['greedy', 'sample'] as const"
              :key="m"
              class="cursor-pointer rounded-full px-3 py-1.5 has-[:checked]:bg-[var(--ember-soft)] has-[:checked]:text-[var(--ink)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-[var(--ember)] text-[var(--muted)]"
            >
              <input v-model="mode" type="radio" name="mode" :value="m" class="sr-only" />
              {{ m === "greedy" ? "Most likely" : "Sample top 5" }}
            </label>
          </fieldset>
          <label class="flex items-center gap-2 text-sm text-[var(--muted)]">
            Words
            <select
              v-model.number="words"
              class="h-9 rounded-lg border border-[var(--line)] bg-[var(--card)] px-2 font-mono text-sm text-[var(--ink)]"
            >
              <option v-for="n in [4, 8, 16]" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <button
            type="button"
            class="ml-auto min-h-11 rounded-full px-4 text-sm text-[var(--muted)] underline-offset-4 hover:text-[var(--ink)] hover:underline"
            @click="p.text.value = ''"
          >
            Clear
          </button>
        </div>
      </div>

      <div
        class="min-w-0 border-t border-[var(--line)] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
      >
        <WindowView :context="p.context.value" :size="p.corpus.value.window" />
      </div>
    </div>
  </section>
</template>
