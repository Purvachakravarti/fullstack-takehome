import React from "react";

type GenericCellProps = {
  value: unknown;
};

const EMPTY = <span className="text-gray-400 italic">—</span>;

function formatValue(value: unknown): React.ReactNode {
  if (value == null) return EMPTY;

  if (typeof value === "boolean") {
    return (
      <span
        className={
          "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium " +
          (value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")
        }
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (typeof value === "number") {
    return <span className="tabular-nums">{value.toLocaleString()}</span>;
  }

  // 🔹 Built-in Date handling (no custom parse function)
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? EMPTY : value.toLocaleString();
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return EMPTY;

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return <span>{d.toLocaleString()}</span>;
    }

    return <span>{trimmed}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return EMPTY;
    return value.length <= 3
      ? value.map(String).join(", ")
      : `${value.length} items`;
  }

  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      return json.length > 80 ? json.slice(0, 77) + "…" : json;
    } catch {
      return "[object]";
    }
  }

  return String(value);
}

export function GenericCell({ value }: GenericCellProps) {
  return (
    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
      {formatValue(value)}
    </div>
  );
}
