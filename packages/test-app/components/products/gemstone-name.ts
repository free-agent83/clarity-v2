export function formatGemstoneDisplayName(
  description: string,
  origin?: string | null,
  treatment?: string | null,
): string {
  let name = description;
  if (origin) name = name.split(origin).join("");
  if (treatment) name = name.split(treatment).join("");
  return name.replace(/\s+/g, " ").trim();
}
