"use client";

import { X } from "lucide-react";
import { Button } from "./ui/button";

interface GlobalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning" | "info" | "confirm"; // 🆕 confirm tipi eklendi
}

export function GlobalModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
}: GlobalModalProps) {
  if (!isOpen) return null;

  const typeColors = {
    success: "border-emerald-500 text-emerald-600 bg-emerald-50/50",
    error: "border-destructive text-destructive bg-destructive/5",
    warning: "border-amber-500 text-amber-600 bg-amber-50/50",
    info: "border-primary text-primary bg-primary/5",
    confirm: "border-amber-500 text-amber-600 bg-amber-50/50",
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[100] flex items-center justify-center bg-black/50/70 backdrop-blur-sm animate-in fade-in duration-250">
      <div className="bg-background w-full max-w-md rounded-xl border p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          className={`p-3 rounded-lg border text-sm font-medium ${typeColors[type]}`}
        >
          {message}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {type === "confirm" && onConfirm ? (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="cursor-pointer"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                className="cursor-pointer font-bold"
              >
                Evet
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              className="px-5 cursor-pointer shadow-sm"
              variant={type === "error" ? "destructive" : "default"}
            >
              Tamam
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
