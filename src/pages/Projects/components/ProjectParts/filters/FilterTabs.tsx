import { useEffect, useRef, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useGetAllGroupedFilters } from "@/hooks/query";

import { FilterTabContent } from "./FilterTabContent";

export function FilterTabs() {
  const filterTabs = useGetAllGroupedFilters();

  const [selectedTab, setSelectedTab] = useState(filterTabs?.[0]?.name ?? "");

  const tabRefs = useRef<Record<string, HTMLButtonElement>>({});

  const addElToRef = (node: HTMLButtonElement) => {
    if (!node?.id) return;
    tabRefs.current = { ...tabRefs.current, [node?.id]: node };
  };

  useEffect(() => {
    if (!tabRefs.current[selectedTab]) return;
    tabRefs.current[selectedTab]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedTab, tabRefs]);

  if (!filterTabs?.length) return null;

  return (
    <Tabs defaultValue={filterTabs[0]?.name} onValueChange={setSelectedTab}>
      <TabsList className="flex h-auto w-full justify-start overflow-auto rounded-none">
        {filterTabs.map((tab) => (
          <TabsTrigger
            key={`filterTab_${tab.id}`}
            value={tab.name}
            id={tab.name}
            className="shrink-0 grow px-4 py-4"
            type="button"
            ref={addElToRef}
          >
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {filterTabs.map((tab) => (
        <TabsContent key={`filterTabContent_${tab.id}`} value={tab.name}>
          <FilterTabContent tab={tab} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
