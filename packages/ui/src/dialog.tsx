"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "./button";

export interface DialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly closeLabel?: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Dialog({ open, title, description, closeLabel = `Close ${title}`, onClose, children }: DialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const dialogId = useId().replace(/:/g, "");

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], [tabindex]:not([tabindex='-1'])"))
        .filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocusedRef.current?.focus();
    };
  }, [open]);

  if (!open) return null;
  const titleId = `${dialogId}-title`;
  const descriptionId = description ? `${titleId}-description` : undefined;

  return <div className="ui-dialog-backdrop" role="presentation"><section ref={dialogRef} className="ui-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}><div className="ui-dialog-heading"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button ref={closeButtonRef} type="button" className="ui-dialog-close" aria-label={closeLabel} onClick={onClose}>×</button></div>{children}</section></div>;
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
