import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";

import { LoadingSpinner } from "../../../components/LoadingSpinner";
import type { PostsCellProps } from "@/types";

export function PostsCell({ count, posts, isLoading }: PostsCellProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const displayCount =
    isLoading || count === null ? "—" : count === 0 ? "-" : count;

  const clearClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = (ms = 120) => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), ms);
  };

  return (
    <>
      {/* Trigger */}
      <span
        ref={refs.setReference}
        className="cursor-pointer text-blue-400 hover:text-blue-300 hover:underline"
        onMouseEnter={() => {
          clearClose();
          setOpen(true);
        }}
        onMouseLeave={() => scheduleClose()}
      >
        {displayCount}
      </span>

      {/* Tooltip */}
      {open &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="
              z-50 w-96 max-w-[90vw]
              rounded-lg border border-white/10
              bg-gray-900 p-3 shadow-xl
              max-h-[min(60vh,420px)] overflow-y-auto overflow-x-hidden
            "
            onMouseEnter={() => {
              clearClose();
              setOpen(true);
            }}
            onMouseLeave={() => scheduleClose()}
          >
            {isLoading && <LoadingSpinner size="sm" className="py-2" />}

            {!isLoading && posts.length === 0 && (
              <div className="text-sm text-gray-300">No posts</div>
            )}

            {!isLoading &&
              posts.map((p) => (
                <div key={p.id} className="mb-3 last:mb-0">
                  <div className="text-sm font-semibold text-gray-100">
                    {p.title ?? "(untitled)"}
                  </div>

                  <div className="mt-1 text-xs text-gray-300 whitespace-pre-wrap break-words">
                    {p.content || (
                      <span className="text-gray-500 italic">No content</span>
                    )}
                  </div>

                  <div className="mt-2 text-[11px] text-gray-400">
                    Created:{" "}
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Updated:{" "}
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "—"}
                  </div>
                </div>
              ))}
          </div>,
          document.body,
        )}
    </>
  );
}
