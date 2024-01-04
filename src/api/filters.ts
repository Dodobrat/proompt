type DataResponse<TData, TFilterType extends FilterType> = Promise<{
  meta: Meta<TFilterType>;
  data: TData[];
}>;

export enum FilterType {
  Grid = "grid",
  List = "list",
}

type Meta<TFilterType extends FilterType> = {
  filterTitle: string;
  filterType: TFilterType;
};

export type Entry = {
  name: string;
  description: string;
};

export type OptionsEntry = {
  name: string;
  filterName: string;
  options: string[];
};

export default {
  getAngles(): DataResponse<Entry, FilterType.Grid> {
    return fetch("/data/angles.json").then((res) => res.json());
  },
  getArchitects(): DataResponse<Entry, FilterType.Grid> {
    return fetch("/data/architects.json").then((res) => res.json());
  },
  getArchitecture(): DataResponse<OptionsEntry, FilterType.List> {
    return fetch("/data/architecture.json").then((res) => res.json());
  },
  getFurniture(): DataResponse<OptionsEntry, FilterType.List> {
    return fetch("/data/furniture.json").then((res) => res.json());
  },
  getInteriorDesigners(): DataResponse<Entry, FilterType.Grid> {
    return fetch("/data/interiorDesigners.json").then((res) => res.json());
  },
  getRoomTypes(): DataResponse<Entry, FilterType.Grid> {
    return fetch("/data/roomTypes.json").then((res) => res.json());
  },
};
