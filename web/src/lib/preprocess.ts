// The training text pipeline (pyTorch/advancedTools/wordPreprocessing.py) rebuilt for the browser:
// remove digits and ASCII punctuation, split into words, then turn each word into model tokens.
// NLTK's word_tokenize and WordNet lemmatiser are replaced by forms.json, which the export script
// builds from the same corpus: for every word of the corpus that training changed, the tokens it became.

/** Python's string.punctuation plus \d, as in remove_numbers_and_special_chars. */
const DIGITS_AND_PUNCTUATION = /[\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g;

/** Typographic quotes survive the cleaning; word_tokenize makes them tokens of their own. */
const QUOTES = /([’‘“”])/;

export type TokenKind = "exact" | "form" | "lemma" | "unknown";

export interface Token {
  /** what the user wrote (after cleaning) */
  surface: string;
  /** what the model sees */
  token: string;
  /** index in the vocabulary, or null when the model has never seen the word */
  id: number | null;
  kind: TokenKind;
}

export type Forms = Record<string, string[]>;

export interface Vocabulary {
  tokens: string[];
  index: Map<string, number>;
  forms: Forms;
}

export function makeVocabulary(tokens: string[], forms: Forms): Vocabulary {
  return { tokens, index: new Map(tokens.map((t, i) => [t, i])), forms };
}

export function clean(text: string): string {
  return text.replace(DIGITS_AND_PUNCTUATION, "");
}

/** A plural the corpus never contained, reduced the way the noun lemmatiser would (only when the result is known). */
function guessLemma(word: string, index: Map<string, number>): string | null {
  const candidates: string[] = [];
  if (word.endsWith("ies") && word.length > 4) candidates.push(`${word.slice(0, -3)}y`);
  if (word.endsWith("es") && word.length > 3) candidates.push(word.slice(0, -2));
  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 2)
    candidates.push(word.slice(0, -1));
  return candidates.find((c) => index.has(c)) ?? null;
}

function tokenOf(surface: string, token: string, kind: TokenKind, vocab: Vocabulary): Token {
  const id = vocab.index.get(token);
  return id === undefined
    ? { surface, token, id: null, kind: "unknown" }
    : { surface, token, id, kind };
}

/** One whitespace-separated word to its model tokens. */
export function wordToTokens(word: string, vocab: Vocabulary): Token[] {
  const form = vocab.forms[word];
  if (form) return form.map((t) => tokenOf(word, t, "form", vocab));
  if (vocab.index.has(word)) return [tokenOf(word, word, "exact", vocab)];
  const parts = word.split(QUOTES).filter(Boolean);
  if (parts.length > 1) return parts.flatMap((p) => wordToTokens(p, vocab));
  const lemma = guessLemma(word, vocab.index);
  if (lemma) return [tokenOf(word, lemma, "lemma", vocab)];
  return [{ surface: word, token: word, id: null, kind: "unknown" }];
}

export function tokenize(text: string, vocab: Vocabulary): Token[] {
  return clean(text)
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((w) => wordToTokens(w, vocab));
}

export interface Context {
  /** every token of the text that counts as context */
  tokens: Token[];
  /** the last `size` known tokens: what goes into the LSTM */
  window: Token[];
  /** a half-typed last word, used to filter the suggestions; empty when the text ends with a space */
  prefix: string;
}

/**
 * Split the text into context and the word being typed. When the text does not end with whitespace,
 * its last word is treated as unfinished: it is not fed to the model but filters the suggestions.
 */
export function buildContext(text: string, vocab: Vocabulary, size: number): Context {
  const endsOpen = text.length > 0 && !/\s$/.test(text);
  const match = endsOpen ? /(\S+)$/.exec(text) : null;
  const rawPrefix = match?.[1] ?? "";
  const body = rawPrefix ? text.slice(0, text.length - rawPrefix.length) : text;
  const tokens = tokenize(body, vocab);
  const window = tokens.filter((t) => t.id !== null).slice(-size);
  return { tokens, window, prefix: clean(rawPrefix) };
}

export interface Suggestion {
  token: string;
  id: number;
  probability: number;
}

/** Softmax of the logits, then the k most likely tokens (optionally only those starting with a prefix). */
export function topK(
  logits: ArrayLike<number>,
  tokens: string[],
  k: number,
  prefix = "",
): Suggestion[] {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) max = Math.max(max, logits[i] as number);
  const exp = new Float64Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    const e = Math.exp((logits[i] as number) - max);
    exp[i] = e;
    sum += e;
  }
  const lower = prefix.toLowerCase();
  const picked: Suggestion[] = [];
  for (let i = 0; i < exp.length; i++) {
    const token = tokens[i];
    if (token === undefined || (lower && !token.toLowerCase().startsWith(lower))) continue;
    const probability = (exp[i] as number) / sum;
    if (picked.length < k) {
      picked.push({ token, id: i, probability });
      picked.sort((a, b) => b.probability - a.probability);
    } else if (probability > (picked[k - 1] as Suggestion).probability) {
      picked[k - 1] = { token, id: i, probability };
      picked.sort((a, b) => b.probability - a.probability);
    }
  }
  return picked;
}

/** Pick one suggestion: the most likely, or a draw weighted by probability (temperature applied). */
export function choose(
  suggestions: Suggestion[],
  mode: "greedy" | "sample",
  random: () => number = Math.random,
  temperature = 0.8,
): Suggestion | undefined {
  if (mode === "greedy" || suggestions.length < 2) return suggestions[0];
  const weights = suggestions.map((s) => Math.pow(s.probability, 1 / temperature));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = random() * total;
  for (let i = 0; i < suggestions.length; i++) {
    r -= weights[i] as number;
    if (r <= 0) return suggestions[i];
  }
  return suggestions[suggestions.length - 1];
}

/** Insert a chosen word: replace the half-typed word if there is one, then end with a space. */
export function insertWord(text: string, word: string, prefix: string): string {
  const base = prefix ? text.replace(/\S+$/, "") : text;
  const glue = base.length === 0 || /\s$/.test(base) ? "" : " ";
  return `${base}${glue}${word} `;
}
