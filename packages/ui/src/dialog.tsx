"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "./button";

export interface DialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Dialog({ open, title, description, onClose, children }: DialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-title`;
  const descriptionId = description ? `${titleId}-description` : undefined;

  return <div className="ui-dialog-backdrop" role="presentation"><section className="ui-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}><div className="ui-dialog-heading"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button ref={closeButtonRef} type="button" className="ui-dialog-close" aria-label={`Close ${title}`} onClick={onClose}>×</button></div>{children}</section></div>;
}

export interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", onCancel, onConfirm }: ConfirmDialogProps) {
  return <Dialog open={open} title={title} description={description} onClose={onCancel}><div className="ui-dialog-actions"><Button type="button" onClick={onCancel}>Cancel</Button><Button type="button" variant="danger" onClick={onConfirm}>{confirmLabel}</Button></div></Dialog>;
}
