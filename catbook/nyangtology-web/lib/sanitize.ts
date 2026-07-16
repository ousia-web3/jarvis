const emojiPattern = /[\p{Extended_Pictographic}\uFE0F\u200D]/gu;

export function cleanDisplayText(value: string): string {
  return value.replace(emojiPattern, '').replace(/\s+/g, ' ').trim();
}
