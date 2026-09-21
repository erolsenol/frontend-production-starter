export interface SubmitState { readonly status: "idle" | "submitting" | "success" | "error"; readonly message?: string; }
export const initialSubmitState: SubmitState = { status: "idle" };
