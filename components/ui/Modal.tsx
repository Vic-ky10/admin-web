"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({
  open,
  title,
  children,
  onClose,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-900/20">

        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 p-6">

          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-slate-900"
            aria-label="Close modal"
          >
            x
          </button>

        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">
          {children}
        </div>

      </div>

    </div>
  );
}
