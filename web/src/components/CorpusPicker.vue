<script setup lang="ts">
import { formatBytes, type Corpus } from "../lib/corpora";

defineProps<{
  corpora: Corpus[];
  status: Record<string, string | undefined>;
  progress: Record<string, number | undefined>;
}>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <fieldset>
    <legend class="eyebrow mb-3">Model · trained on</legend>
    <div class="grid gap-2 sm:grid-cols-3">
      <label
        v-for="c in corpora"
        :key="c.id"
        class="group relative flex cursor-pointer flex-col gap-1 rounded-2xl border border-[var(--line)] p-3.5 transition-colors hover:border-[var(--muted)] has-[:checked]:border-[var(--ember)] has-[:checked]:bg-[var(--ember-soft)] has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ember)]"
      >
        <input v-model="model" type="radio" name="corpus" :value="c.id" class="sr-only" />
        <span class="flex items-center justify-between gap-2">
          <span class="font-display text-lg font-semibold">{{ c.label }}</span>
          <span
            v-if="status[c.id] === 'ready'"
            class="rounded-full bg-[var(--sage-soft)] px-2 py-0.5 font-mono text-[0.7rem] text-[var(--sage)]"
            >loaded</span
          >
          <span
            v-else-if="status[c.id] === 'loading'"
            class="rounded-full bg-[var(--amber-soft)] px-2 py-0.5 font-mono text-[0.7rem] text-[var(--amber)]"
            >{{ Math.round((progress[c.id] ?? 0) * 100) }}%</span
          >
        </span>
        <span class="flex flex-wrap gap-x-2 font-mono text-xs text-[var(--muted)]">
          <span class="whitespace-nowrap">{{ c.window }}-word window</span>
          <span class="whitespace-nowrap">{{ c.vocabSize.toLocaleString("en") }} words</span>
          <span class="whitespace-nowrap">{{ formatBytes(c.modelBytes) }}</span>
        </span>
      </label>
    </div>
  </fieldset>
</template>
