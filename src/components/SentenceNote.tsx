import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SentenceNoteProps {
  children: React.ReactNode;
  title?: string;
  note: string;
  renderNote?: (content: string) => React.ReactNode;
}

// Wide screens have room beside the 56rem article; smaller screens use a sheet.
const marginQuery = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export function SentenceNote({ children, title, note, renderNote }: SentenceNoteProps) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(16);

  const cancelClose = () => clearTimeout(closeTimer.current);
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setHovered(false), 300);
  };
  const showMargin = () => {
    cancelClose();
    if (!open && window.matchMedia(marginQuery).matches) {
      setTop(Math.max(16, trigger.current?.getBoundingClientRect().top ?? 16));
      setHovered(true);
    }
  };

  useLayoutEffect(() => {
    if (hovered && card.current) {
      const height = card.current.getBoundingClientRect().height;
      setTop((position) => Math.max(16, Math.min(position, window.innerHeight - height - 16)));
    }
  }, [hovered]);

  useEffect(() => {
    if (!hovered) return;
    const dismiss = (event?: Event) => {
      // Keep the annotation open when scrolling a code block inside it.
      if (event?.target instanceof Node && card.current?.contains(event.target)) return;
      setHovered(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hovered]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => {
        cancelClose();
        setHovered(false);
        setOpen(next);
      }}>
        <DialogTrigger asChild>
          <button
            ref={trigger}
            type="button"
            className="sentence-note-trigger"
            data-active={hovered || open}
            aria-describedby={hovered ? id : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") showMargin();
            }}
            onPointerLeave={closeSoon}
            onFocus={showMargin}
            onBlur={closeSoon}
            onClick={(event) => {
              if (window.matchMedia(marginQuery).matches) {
                event.preventDefault();
                showMargin();
              }
            }}
          >
            {children}
            <span className="sr-only"> (open annotation{title ? `: ${title}` : ""})</span>
          </button>
        </DialogTrigger>
        <DialogContent className="sentence-note-sheet">
          <div className="sentence-note-handle" aria-hidden="true" />
          <DialogTitle className={title ? "pr-6 leading-snug" : "sr-only"}>{title || "Annotation"}</DialogTitle>
          <DialogDescription asChild>
            <div className="sentence-note-body text-base leading-relaxed text-foreground/80">
              {renderNote ? renderNote(note) : note}
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
      {hovered && createPortal(
        <aside
          ref={card}
          id={id}
          role="note"
          className="sentence-note-margin"
          style={{ top }}
          onPointerEnter={cancelClose}
          onPointerLeave={closeSoon}
          onFocus={cancelClose}
          onBlur={closeSoon}
        >
          {title && <p className="mb-3 font-semibold leading-snug">{title}</p>}
          <div className="sentence-note-body text-sm leading-relaxed text-foreground/80">
            {renderNote ? renderNote(note) : note}
          </div>
        </aside>,
        document.body,
      )}
    </>
  );
}
