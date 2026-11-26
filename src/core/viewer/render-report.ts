export type RenderReport =
  | { readonly status: "rendered" }
  | { readonly status: "failed"; readonly code: "render-failed" };
