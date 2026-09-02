import data from "./lingo.json";

export type Item = { es: string; ar: string; pr?: string };
export type Section = { title: string; items: Item[] };

export const sections = data.sections as Section[];
export const phrases = data.phrases as Item[];
export const numbers = data.numbers as Item[];
export const icons = ["📚", "👋", "☀️", "🛍️", "🍽️", "✈️", "🧠"];
