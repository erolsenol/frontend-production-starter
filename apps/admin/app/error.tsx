"use client";

export default function GlobalError({ reset }: { readonly reset: () => void }) {
  return (
    <main className="page-stack" role="alert">
      <h1>Something went wrong</h1>
      <p>Try again or return to the dashboard.</p>
      <button className="ui-button ui-button-primary ui-button-md" onClick={reset} type="button">
        Try again
      </button>
    </main>
  );
}
