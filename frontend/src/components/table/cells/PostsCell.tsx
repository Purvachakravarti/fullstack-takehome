import { useState } from "react";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import type { PostsCellProps } from "@/types";

export function PostsCell({ count, posts, isLoading }: PostsCellProps) {
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);

  function onEnter(e: React.MouseEvent<HTMLDivElement>) {
    setOpen(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenAbove(spaceBelow < 320);
  }

  const displayCount =
    isLoading || count === null ? "—" : count === 0 ? "-" : count;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={onEnter}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="cursor-pointer text-blue-400 hover:text-blue-300 hover:underline">
        {displayCount}
      </span>

      {open && (
        <div
          className={`
            absolute right-0
            ${openAbove ? "bottom-full mb-2" : "top-full mt-2"}
            w-96 max-w-[90vw]
            rounded-lg border border-white/10
            bg-gray-900 p-3 shadow-xl
            z-50 max-h-[min(60vh,420px)] overflow-y-auto overflow-x-hidden
          `}
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
        </div>
      )}
    </div>
  );
}
