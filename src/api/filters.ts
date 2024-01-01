type DataResponse<TData> = Promise<{ data: TData[] }>;

type NamedEntry = { name: string };
type Entry = NamedEntry & { description: string };
type OptionsEntry = { name: string; options: string[] };

export default {
  getAngles(): DataResponse<Entry> {
    return fetch("/data/angles.json").then((res) => res.json());
  },
  getArchitects(): DataResponse<Entry> {
    return fetch("/data/architects.json").then((res) => res.json());
  },
  getArchitecture(): DataResponse<OptionsEntry> {
    return fetch("/data/architecture.json").then((res) => res.json());
  },
  getFurniture(): DataResponse<OptionsEntry> {
    return fetch("/data/furniture.json").then((res) => res.json());
  },
  getInteriorDesigners(): DataResponse<Entry> {
    return fetch("/data/interiorDesigners.json").then((res) => res.json());
  },
  getRoomTypes(): DataResponse<NamedEntry> {
    return fetch("/data/roomTypes.json").then((res) => res.json());
  },
};
