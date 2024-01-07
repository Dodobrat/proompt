import { useQuery } from "@tanstack/react-query";

import { filtersApi } from "@/api";
import { Filter, FilterGroupData, FilterGroupFileData } from "@/api/filters";

const filterQueryKeys = {
  all: () => ["filters"],
  tabs: () => [...filterQueryKeys.all(), "tabs"],
  groups: () => [...filterQueryKeys.all(), "groups"],
} as const;

export function useGetFilterTabs() {
  return useQuery({
    queryKey: filterQueryKeys.all(),
    queryFn: filtersApi.getFilterTabs,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetAllFilterGroups() {
  return useQuery({
    queryKey: filterQueryKeys.groups(),
    queryFn: filtersApi.getAllFilterGroups,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export type GroupedFilter = Filter & {
  groups: (FilterGroupFileData<FilterGroupData> | null)[];
};

export function useGetAllGroupedFilters(): GroupedFilter[] | null {
  const { data: tabs } = useGetFilterTabs();
  const { data: groups } = useGetAllFilterGroups();

  if (!tabs || !groups) return null;

  const groupedFilters = tabs.data
    .sort((a, b) => a.order - b.order)
    .map((tab) => {
      const tabGroups = groups.filter(
        (group) => group?.meta.filterParentId === tab.id,
      );

      return {
        ...tab,
        groups: tabGroups,
      };
    });

  return groupedFilters;
}
