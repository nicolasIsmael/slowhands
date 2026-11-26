const ACCEPTED_EXTENSIONS = [".musicxml", ".xml", ".mxl"];

export function hasAcceptedScoreExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}
