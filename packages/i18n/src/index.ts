export type Locale = "en" | "tr";
export const createTranslator = (messages: Readonly<Record<string, string>>, fallback = "en") => (key: string): string => messages[key] ?? (fallback === "en" ? key : messages[key] ?? key);
