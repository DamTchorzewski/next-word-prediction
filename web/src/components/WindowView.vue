<script setup lang="ts">
import { computed } from "vue";
import type { Context, Token } from "../lib/preprocess";

const props = defineProps<{ context: Context | null; size: number }>();

const slots = computed<(Token | null)[]>(() => {
  const window = props.context?.window ?? [];
  return [...Array<null>(Math.max(0, props.size - window.length)).fill(null), ...window];
});
const skipped = computed(() => props.context?.tokens.filter((t) => t.id === null) ?? []);
const changed = computed(
  () => props.context?.window.filter((t) => t.kind === "form" || t.kind === "lemma") ?? [],
);
const short = computed(() => (props.context?.window.length ?? 0) < props.size);
</script>

<template>
  <section aria-labelledby="window-title" class="flex flex-col gap-4">
    <div class="flex items-baseline justify-between gap-3">
      <h2 id="window-title" class="eyebrow">What the model sees</h2>
      <span class="font-mono text-xs text-[var(--muted)]"
        >{{ context?.window.length ?? 0 }} / {{ size }} tokens</span
      >
    </div>
    <ol
      class="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-1.5"
      :aria-label="`Input window of ${size} tokens, oldest first`"
    >
      <li
        v-for="(slot, i) in slots"
        :key="i"
        class="flex min-h-16 flex-col justify-between rounded-lg border px-2 py-1.5"
        :class="
          slot
            ? 'border-[var(--line)] bg-[var(--card)]'
            : 'border-dashed border-[var(--line)] text-[var(--muted)]'
        "
      >
        <template v-if="slot">
          <span
            class="font-mono text-[0.8rem] leading-tight font-medium [overflow-wrap:anywhere]"
            :title="slot.token"
            >{{ slot.token }}</span
          >
          <span
            class="mt-1 flex flex-wrap items-center justify-between gap-1 font-mono text-[0.65rem] text-[var(--muted)]"
          >
            <span>#{{ slot.id }}</span>
            <span
              v-if="slot.kind !== 'exact'"
              class="rounded bg-[var(--amber-soft)] px-1 text-[var(--amber)]"
              :title="`typed as “${slot.surface}”`"
              >{{ slot.kind === "lemma" ? "lemma" : "form" }}</span
            >
          </span>
        </template>
        <span v-else class="m-auto font-mono text-xs" aria-label="empty">·</span>
      </li>
    </ol>
    <ul class="flex flex-col gap-1.5 text-sm text-[var(--muted)]">
      <li v-if="!context || context.window.length === 0">
        Type a few words: the last {{ size }} words the model knows fill the window from the right.
      </li>
      <li v-else-if="short">
        Shorter than the {{ size }} words the model was trained on; it still predicts, with less to
        go on.
      </li>
      <li v-if="changed.length">
        Rewritten as in training:
        <span v-for="(t, i) in changed" :key="i" class="font-mono text-[var(--ink)]"
          >{{ i ? ", " : "" }}{{ t.surface }} → {{ t.token }}</span
        >
      </li>
      <li v-if="skipped.length">
        Not in this model's vocabulary, skipped:
        <span class="font-mono text-[var(--ink)]">{{
          skipped.map((t) => t.surface).join(", ")
        }}</span>
      </li>
      <li v-if="context?.prefix">
        Completing the word you are typing:
        <span class="font-mono text-[var(--ink)]">{{ context.prefix }}…</span>
      </li>
    </ul>
  </section>
</template>
