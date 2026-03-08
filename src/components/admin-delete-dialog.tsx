"use client";

import type { ReactNode } from "react";

type AdminDeleteDialogProps = {
  children: ReactNode;
  message?: string;
};

/**
 * Wraps a <form> tree. When the user clicks a [type=submit] inside,
 * a native confirm dialog is shown before the form is submitted.
 */
export function AdminDeleteDialog({
  children,
  message = "Confirmer la suppression ? Cette action est irréversible.",
}: AdminDeleteDialogProps) {
  return (
    <div
      onSubmit={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </div>
  );
}
