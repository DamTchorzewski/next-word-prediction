<script setup lang="ts">
import { ref } from "vue";
import LogoMark from "./LogoMark.vue";

const dark = ref(document.documentElement.classList.contains("dark"));

function toggleTheme() {
  dark.value = !dark.value;
  document.documentElement.classList.toggle("dark", dark.value);
  localStorage.setItem("theme", dark.value ? "dark" : "light");
}

const links = [
  { href: "#demo", label: "Demo" },
  { href: "#how", label: "How it works" },
  { href: "#models", label: "Models" },
];
</script>

<template>
  <header
    class="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
      <a
        href="#top"
        class="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight"
      >
        <LogoMark class="h-7 w-7" />
        <span>Next-word <span class="text-[var(--ember)]">Prediction</span></span>
      </a>
      <nav aria-label="Sections" class="ml-auto hidden md:block">
        <ul class="flex items-center gap-1 text-sm">
          <li v-for="link in links" :key="link.href">
            <a
              :href="link.href"
              class="rounded-full px-3 py-2 text-[var(--muted)] transition-colors hover:bg-[var(--ember-soft)] hover:text-[var(--ink)]"
              >{{ link.label }}</a
            >
          </li>
        </ul>
      </nav>
      <div class="ml-auto flex items-center gap-2 md:ml-2">
        <a
          href="https://github.com/DamTchorzewski/next-word-prediction"
          class="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--line)] px-4 text-sm font-medium transition-colors hover:border-[var(--ink)]"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" class="h-4 w-4 fill-current">
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <span class="hidden sm:inline">Source</span>
          <span class="sr-only sm:hidden">Source on GitHub</span>
        </a>
        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] transition-colors hover:border-[var(--ink)]"
          :aria-pressed="dark"
          aria-label="Dark theme"
          @click="toggleTheme"
        >
          <svg
            v-if="dark"
            aria-hidden="true"
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
          <svg
            v-else
            aria-hidden="true"
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="12" cy="12" r="4" />
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>
