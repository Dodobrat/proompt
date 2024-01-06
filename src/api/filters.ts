export type DataResponse<T> = Promise<{ data: T[] }>;

export type FilterGroupFileData<T> = {
  meta: FilterGroupMeta;
  data: T[];
};
export type FilterGroupDataResponse<T> = Promise<FilterGroupFileData<T>>;

export enum FilterChoice {
  Single = "single",
  Multiple = "multiple",
}

export type Filter = {
  id: number;
  order: number;
  name: string;
  choices: FilterChoice;
};

export type FilterGroupMeta = {
  filterTitle: string;
  filterName: string;
  filterParentId: number;
};

export type FilterGroupData = {
  imgSrc: string;
  name: string;
  description: string;
};

export default {
  getFilterTabs(): DataResponse<Filter> {
    return fetch("/data/filterTabs.json").then((res) => res.json());
  },

  async getAllFilterGroups() {
    const manifest: { data: string[] } = await fetch(
      "/data/manifest.json",
    ).then((res) => res.json(), console.error);

    if (!manifest.data) throw new Error("No data found in manifest.json");

    const data: FilterGroupDataResponse<FilterGroupData>[] = manifest.data.map(
      (name) => fetch(`/data/${name}`).then((res) => res.json()),
    );

    const resolvedData = await Promise.allSettled(data);
    const dataWithMeta = resolvedData.map((res) => {
      if (res.status === "rejected") {
        console.error(res.reason);
        return null;
      }
      return res.value;
    });

    return dataWithMeta.filter(Boolean);
  },
};
