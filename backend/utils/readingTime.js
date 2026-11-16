export const readingTime = (content = "") =>
  Math.max(
    1,
    Math.ceil(
      content
        .replace(/<[^>]*>/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length / 220,
    ),
  );
