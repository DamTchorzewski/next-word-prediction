import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Every request must stay on the page's own origin: the demo never talks to a server.
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith("http://localhost:4319/")) errors.push(`external request ${r.url()}`);
  });
  (page as unknown as { errors: string[] }).errors = errors;
});

test.afterEach(async ({ page }) => {
  expect((page as unknown as { errors: string[] }).errors).toEqual([]);
});

test("predicts the next word with the sentences model", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Type a few words");
  await page.getByRole("button", { name: "Embrace the…" }).click();
  const chips = page.getByRole("list", { name: "Suggested next words" }).getByRole("button");
  await expect(chips).toHaveCount(5, { timeout: 30_000 });
  const word = (await chips.first().locator("[data-token]").textContent())?.trim() ?? "";
  await chips.first().click();
  await expect(page.getByLabel("Your text")).toHaveValue(`Embrace the ${word} `);
  await expect(page.getByRole("list", { name: /Input window of 5 tokens/ })).toContainText(word);
});

test("rewrites a plural to its lemma and completes a sentence", async ({ page }) => {
  await page.goto("./");
  const input = page.getByLabel("Your text");
  await input.fill("Let your dreams ");
  await expect(page.getByText("dreams → dream")).toBeVisible({ timeout: 30_000 });
  await page.getByRole("button", { name: /Complete 8 words/ }).click();
  await expect(page.getByRole("button", { name: /Complete 8 words/ })).toBeEnabled({
    timeout: 30_000,
  });
  const words = (await input.inputValue()).trim().split(/\s+/);
  expect(words.length).toBeGreaterThanOrEqual(11);
});

test("switches to the stories model with a 10-word window", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("radio", { name: /Stories/ }).check({ force: true });
  await page.getByLabel("Your text").fill("I had seen little of Holmes lately ");
  await expect(
    page.getByRole("list", { name: "Suggested next words" }).getByRole("button"),
  ).toHaveCount(5, { timeout: 30_000 });
  await expect(page.getByText(/6 \/ 10 tokens|7 \/ 10 tokens/)).toBeVisible();
});

test("has no WCAG 2.2 AA violations, before and after a prediction", async ({ page }) => {
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto("./");
    await page.getByRole("button", { name: "Find peace in the…" }).click();
    await expect(
      page.getByRole("list", { name: "Suggested next words" }).getByRole("button"),
    ).toHaveCount(5, { timeout: 30_000 });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(result.violations.map((v) => `${scheme}: ${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  }
});

test("fits the viewport without horizontal scrolling", async ({ page }) => {
  await page.goto("./");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
