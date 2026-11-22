<script setup lang="ts">
import { formatPercent } from "../lib/corpora";
import type { Suggestion } from "../lib/preprocess";

defineProps<{ suggestions: Suggestion[]; prefix: string }>();
defineEmits<{ pick: [Suggestion] }>();

/** the bar is the probability itself: 100% of the chip width is certainty */
const width = (s: Suggestion) => `${Math.max(2, s.probability * 100)}%`;
</script>

<template>
  <ol class="flex flex-wrap gap-2" aria-label="Suggested next words">
    <li
      v-for="(s, i) in suggestions"
      :key="`${s.id}-${i}`"
      class="chip-enter"
      :style="{ animationDelay: `${i * 30}ms` }"
    >
      <button
        type="button"
        class="group relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--card)] py-2 pr-3 pl-3 text-left transition-[border-color,transform] hover:-translate-y-px hover:border-[var(--ember)] active:translate-y-0"
        :aria-keyshortcuts="i < 9 ? `Alt+${i + 1}` : undefined"
        @click="$emit('pick', s)"
      >
        <span
          aria-hidden="true"
          class="absolute bottom-0 left-0 h-[3px] rounded-r-full bg-[var(--ember)] transition-[width] duration-300"
          :style="{ width: width(s) }"
        />
        <span aria-hidden="true" class="relative font-mono text-[0.7rem] text-[var(--muted)]">{{
          i + 1
        }}</span>
        <span data-token class="relative text-base font-medium">
          <template v-if="prefix && s.token.toLowerCase().startsWith(prefix.toLowerCase())"
            ><span class="text-[var(--muted)]">{{ s.token.slice(0, prefix.length) }}</span
            >{{ s.token.slice(prefix.length) }}</template
          >
          <template v-else>{{ s.token }}</template>
        </span>
        <span class="relative font-mono text-xs text-[var(--muted)] tabular-nums">{{
          formatPercent(s.probability, 1)
        }}</span>
      </button>
    </li>
  </ol>
</template>
