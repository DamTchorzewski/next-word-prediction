import { describe, expect, it } from "vitest";
import {
  buildContext,
  choose,
  clean,
  insertWord,
  makeVocabulary,
  tokenize,
  topK,
} from "./preprocess";

const vocab = makeVocabulary(
  ["Embrace", "the", "journey", "dream", "can", "not", "a", "Alice", "’", "s", "joy", "story"],
  { dreams: ["dream"], cannot: ["can", "not"], as: ["a"], "Alice’s": ["Alice", "’", "s"] },
);

describe("clean", () => {
  it("removes digits and ASCII punctuation like the training script", () => {
    expect(clean("It's 2024, don't stop!")).toBe("Its  dont stop");
  });
  it("keeps typographic quotes", () => {
    expect(clean("Alice’s")).toBe("Alice’s");
  });
});

describe("tokenize", () => {
  it("uses the corpus forms for lemmas and word_tokenize splits", () => {
    const tokens = tokenize("Embrace the dreams cannot", vocab);
    expect(tokens.map((t) => t.token)).toEqual(["Embrace", "the", "dream", "can", "not"]);
    expect(tokens.map((t) => t.kind)).toEqual(["exact", "exact", "form", "form", "form"]);
  });
  it("splits typographic quotes into their own tokens", () => {
    expect(tokenize("Alice’s", vocab).map((t) => t.token)).toEqual(["Alice", "’", "s"]);
  });
  it("reduces an unseen plural only when the singular is known", () => {
    const [stories, cats] = tokenize("stories cats", vocab);
    expect(stories).toMatchObject({ token: "story", kind: "lemma", id: 11 });
    expect(cats).toMatchObject({ token: "cats", kind: "unknown", id: null });
  });
  it("is case-sensitive like the vocabulary", () => {
    expect(tokenize("embrace", vocab)[0]?.kind).toBe("unknown");
  });
});

describe("buildContext", () => {
  it("keeps the last known tokens up to the window size", () => {
    const ctx = buildContext("Embrace the journey the dreams ", vocab, 3);
    expect(ctx.window.map((t) => t.token)).toEqual(["journey", "the", "dream"]);
    expect(ctx.prefix).toBe("");
  });
  it("treats a word without a trailing space as a prefix", () => {
    const ctx = buildContext("Embrace the jo", vocab, 5);
    expect(ctx.window.map((t) => t.token)).toEqual(["Embrace", "the"]);
    expect(ctx.prefix).toBe("jo");
  });
  it("skips unknown words in the window", () => {
    const ctx = buildContext("Embrace xyz the ", vocab, 5);
    expect(ctx.tokens).toHaveLength(3);
    expect(ctx.window.map((t) => t.token)).toEqual(["Embrace", "the"]);
  });
});

describe("topK", () => {
  const tokens = ["a", "joy", "journey", "the"];
  it("returns probabilities that sum to one over the vocabulary", () => {
    const all = topK([0, 1, 2, 3], tokens, 4);
    expect(all.map((s) => s.token)).toEqual(["the", "journey", "joy", "a"]);
    expect(all.reduce((s, x) => s + x.probability, 0)).toBeCloseTo(1, 6);
  });
  it("filters by a case-insensitive prefix", () => {
    expect(topK([0, 1, 2, 3], tokens, 5, "JO").map((s) => s.token)).toEqual(["journey", "joy"]);
  });
});

describe("choose and insertWord", () => {
  const suggestions = [
    { token: "joy", id: 1, probability: 0.6 },
    { token: "journey", id: 2, probability: 0.4 },
  ];
  it("greedy picks the first, sampling follows the weights", () => {
    expect(choose(suggestions, "greedy")?.token).toBe("joy");
    expect(choose(suggestions, "sample", () => 0.99)?.token).toBe("journey");
  });
  it("replaces a half-typed word and appends a space", () => {
    expect(insertWord("Embrace the jo", "journey", "jo")).toBe("Embrace the journey ");
    expect(insertWord("Embrace the", "joy", "")).toBe("Embrace the joy ");
    expect(insertWord("", "Embrace", "")).toBe("Embrace ");
  });
});
