import type { TableFiltersProps } from "@/types";

export const TableFilters = ({
  draftSearchValue,
  setDraftSearchValue,
  onSearch,
  onClear,
}: TableFiltersProps) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      <input
        className="border rounded px-2 py-1 w-64"
        type="text"
        placeholder="Search name/email/phone..."
        value={draftSearchValue}
        onChange={(e) => setDraftSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
      />

      <button
        className="border rounded px-3 py-1"
        type="button"
        onClick={onSearch}
      >
        Search
      </button>

      <button
        className="border rounded px-3 py-1"
        type="button"
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
};
