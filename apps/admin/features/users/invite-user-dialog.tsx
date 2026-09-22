"use client";

import { useState } from "react";
import type { UserSummary } from "@repo/contracts";
import type { SubmitState } from "@repo/forms";
import { Button, Dialog } from "@repo/ui";
import { inviteUserSchema } from "@repo/validators";
import { createUser } from "./user-api";

const roles = ["Administrator", "Developer", "Analyst", "Viewer"] as const;

interface InviteUserDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onCreated: (user: UserSummary) => void;
}

export function InviteUserDialog({ open, onClose, onCreated }: InviteUserDialogProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });

  const close = () => {
    setSubmitState({ status: "idle" });
    onClose();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = inviteUserSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
    });
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
      <form key={open ? "open" : "closed"} onSubmit={(event) => void submit(event)}>
        <label htmlFor="invite-user-name">Name</label><input id="invite-user-name" name="name" required />
        <label htmlFor="invite-user-email">Email</label><input id="invite-user-email" name="email" required type="email" />
        <label htmlFor="invite-user-role">Role</label><select id="invite-user-role" name="role" defaultValue="Developer">{roles.map((role) => <option key={role}>{role}</option>)}</select>
        {submitState.status === "error" && <p className="form-error" role="alert">{submitState.message}</p>}
        <div className="modal-actions"><Button type="button" onClick={close}>Cancel</Button><Button type="submit" variant="primary" disabled={submitState.status === "submitting"}>{submitState.status === "submitting" ? "Inviting…" : "Invite user"}</Button></div>
      </form>
    </Dialog>
  );
}
