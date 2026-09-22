"use client";

import { useState } from "react";
import type { UserSummary } from "@repo/contracts";
import type { SubmitState } from "@repo/forms";
import { Button, Dialog } from "@repo/ui";
import { inviteUserSchema } from "@repo/validators";
import { createUser } from "./user-api";

const roles = ["Administrator", "Developer", "Analyst", "Viewer"] as const;

interface InviteFormState {
  readonly name: string;
  readonly email: string;
  readonly role: string;
}

interface InviteUserDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (user: UserSummary) => void;
}

const initialForm: InviteFormState = { name: "", email: "", role: "Developer" };

export function InviteUserDialog({ open, onClose, onCreated }: InviteUserDialogProps) {
  const [form, setForm] = useState<InviteFormState>(initialForm);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const close = () => {
    setForm(initialForm);
    setSubmitState({ status: "idle" });
    onClose();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = inviteUserSchema.safeParse(form);
    if (!result.success) {
      setSubmitState({ status: "error", message: result.error.issues[0]?.message ?? "Check the form fields." });
      return;
    }

    setSubmitState({ status: "submitting" });
    try {
      const createdUser = await createUser(result.data);
      onCreated(createdUser);
      close();
    } catch (cause: unknown) {
      setSubmitState({ status: "error", message: cause instanceof Error ? cause.message : "Unable to invite user." });
    }
  };

  return (
    <Dialog open={open} title="Invite user" description="Add a teammate to this workspace." closeLabel="Close invite dialog" onClose={close}>
      <form onSubmit={(event) => void submit(event)}>
        <label>Name<input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.currentTarget.value }))} /></label>
        <label>Email<input required type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.currentTarget.value }))} /></label>
        <label>Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.currentTarget.value }))}>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
        {submitState.status === "error" && <p className="form-error" role="alert">{submitState.message}</p>}
        <div className="modal-actions"><Button type="button" onClick={close}>Cancel</Button><Button type="submit" variant="primary" disabled={submitState.status === "submitting"}>{submitState.status === "submitting" ? "Inviting…" : "Invite user"}</Button></div>
      </form>
    </Dialog>
  );
}
