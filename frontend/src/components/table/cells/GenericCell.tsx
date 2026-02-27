import React from "react";

type GenericCellProps = {
  value: unknown;
};

/**
 * Checks if a string looks like an ISO-ish date and can be parsed.
 * We keep it conservative to avoid turning random strings into dates.
 */
function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  if (typeof value === "string") {
    // quick guard: must include digits + '-' or 'T' to resemble ISO
    const looksDatey =
      /\d/.test(value) && (value.includes("-") || value.includes("T"));
    if (!looksDatey) return null;

    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function formatValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }

  // boolean
  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
          value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // number
  if (typeof value === "number") {
    return <span className="tabular-nums">{value.toLocaleString()}</span>;
  }

  // date
  const d = parseDate(value);
  if (d) {
    return <span className="text-inherit">{d.toLocaleString()}</span>;
  }

  // string
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return <span className="text-gray-400 italic">—</span>;
    return <span className="text-inherit">{trimmed}</span>;
  }

  // array
  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="text-gray-400 italic">—</span>;
    // Display short arrays nicely; long arrays as count
    if (value.length <= 3) {
      return (
        <span className="text-inherit">
          {value.map((v) => String(v)).join(", ")}
        </span>
      );
    }
    return <span className="text-inherit">{value.length} items</span>;
  }

  // object
  if (typeof value === "object") {
    // show compact JSON, but avoid huge blobs
    try {
      const json = JSON.stringify(value);
      const short = json.length > 80 ? json.slice(0, 77) + "…" : json;
      return <span className="text-gray-600 text-xs">{short}</span>;
    } catch {
      return <span className="text-gray-600 text-xs">[object]</span>;
    }
  }

  // fallback
  return <span className="text-inherit">{String(value)}</span>;
}

export function GenericCell({ value }: GenericCellProps) {
  return (
    <div className="whitespace-nowrap overflow-hidden text-ellipsis">
      {formatValue(value)}
    </div>
  );
}
