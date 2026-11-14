"use client";

import { useEffect, useState } from "react";
import { createIdea } from "@/app/actions";
import { ClientRequestId } from "./client-request-id";
import { FormSubmitButton } from "./form-submit-button";
import { ErrorNote } from "./error-note";

const DRAFT_KEY = "nxtgen:idea-draft";

function readDraft(): { title: string; idea: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as { title?: unknown; idea?: unknown };
    return {
      title: typeof draft.title === "string" ? draft.title : "",
      idea: typeof draft.idea === "string" ? draft.idea : "",
    };
  } catch {
    return null;
  }
}

// Idea form with draft persistence: the title and body are saved to
// sessionStorage as the student types, so if the session expires mid-post
// and they are redirected to sign in, their text is restored when they
// return to /ideas/new instead of being lost.
export function IdeaForm({ remix, error }: { remix?: string; error?: string }) {
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [draftApplied, setDraftApplied] = useState(false);

  // Restore any unsaved draft once, on the client only (render-time
  // adjustment, mirroring the prop-sync pattern used in LikeButton).
  if (!draftApplied) {
    setDraftApplied(true);
    const draft = readDraft();
    if (draft) {
      if (draft.title) setTitle(draft.title);
      if (draft.idea) setIdea(draft.idea);
    }
  }

  // Persist the draft on every change.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (title || idea) sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ title, idea }));
      else sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      /* storage unavailable: ignore */
    }
  }, [title, idea]);

  return (
    <form action={createIdea} className="panel space-y-6 p-5 sm:p-8">
      <ErrorNote message={error} />
      <ClientRequestId />
      {remix && <input type="hidden" name="remix_of" value={remix} />}
      <label>
        <span className="label">Heading</span>
        <input
          name="title"
          required
          minLength={3}
          maxLength={120}
          className="field"
          placeholder="Give your idea a clear heading"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          suppressHydrationWarning
        />
      </label>
      <label>
        <span className="label">Your idea</span>
        <textarea
          name="idea"
          required
          minLength={10}
          maxLength={10000}
          rows={12}
          className="field resize-y"
          placeholder="Explain your idea in your own words..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          suppressHydrationWarning
        />
      </label>
      <FormSubmitButton label="Post idea" pendingLabel="Posting…" className="h-13 px-6 text-xs" />
    </form>
  );
}
