import { useState } from "react";
import { TableContent } from "./TableContent";
import { TableFilters } from "./TableFilters";

export const Table = () => {
  const [draftSearchValue, setDraftSearchValue] = useState("");
  const [appliedSearchValue, setAppliedSearchValue] = useState("");

  return (
    <div className="p-2">
      <TableFilters
        draftSearchValue={draftSearchValue}
        setDraftSearchValue={setDraftSearchValue}
        onSearch={() => setAppliedSearchValue(draftSearchValue.trim())}
        onClear={() => {
          setDraftSearchValue("");
          setAppliedSearchValue("");
        }}
      />

      <TableContent searchValue={appliedSearchValue} />
    </div>
  );
};
