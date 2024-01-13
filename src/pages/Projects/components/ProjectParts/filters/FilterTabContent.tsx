import { useState } from "react";

import {
  FilterChoice,
  FilterGroupData,
  FilterGroupFileData,
} from "@/api/filters";
import { GroupedFilter } from "@/hooks/query";

import { NoData } from "../NoData";
import { NoResults } from "../NoResults";

import { FilterGroup } from "./FilterGroup";
import { FilterInput } from "./FilterInput";

export function FilterTabContent({ tab }: { tab: GroupedFilter }) {
  const [search, setSearch] = useState("");

  const filteredGroups = tab.groups?.reduce(
    (acc: FilterGroupFileData<FilterGroupData>[], curr) => {
      if (!curr) return acc;

      const filteredData = curr.data.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description?.toLowerCase().includes(search.toLowerCase()),
      );

      if (!filteredData?.length) return acc;

      acc.push({ ...curr, data: filteredData });

      return acc;
    },
    [],
  );

  const hasNoData = !tab?.groups?.length;
  const hasNoResults = Boolean(search) && !filteredGroups.length;
  const groupCount = tab.groups?.length;
  const isMultiSelect = tab.choiceType === FilterChoice.Multiple;

  return (
    <>
      <FilterInput value={search} onValueChange={setSearch} />

      {hasNoData && <NoData />}
      {hasNoResults && <NoResults />}

      {filteredGroups?.map((group) => {
        if (!group) return "Unhandled Group";

        return (
          <FilterGroup
            key={`filterTabGroup_${tab.name}_${group?.meta.filterName}`}
            group={group}
            groupCount={groupCount}
            isMultiSelect={isMultiSelect}
            search={search}
          />
        );
      })}
    </>
  );
}
