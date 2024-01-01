import { useQuery } from "@tanstack/react-query";

import { filtersApi } from "@/api";

const filterQueryKeys = {
  all: () => ["filters"],
  angles: () => [...filterQueryKeys.all(), "angles"],
  architects: () => [...filterQueryKeys.all(), "architects"],
  architecture: () => [...filterQueryKeys.all(), "architecture"],
  furniture: () => [...filterQueryKeys.all(), "furniture"],
  interiorDesigners: () => [...filterQueryKeys.all(), "interiorDesigners"],
  roomTypes: () => [...filterQueryKeys.all(), "roomTypes"],
} as const;

const queryConfigs = {
  angles: {
    queryKey: filterQueryKeys.angles(),
    queryFn: filtersApi.getAngles,
    staleTime: Infinity,
    gcTime: Infinity,
  },
  architects: {
    queryKey: filterQueryKeys.architects(),
    queryFn: filtersApi.getArchitects,
    staleTime: Infinity,
    gcTime: Infinity,
  },
  architecture: {
    queryKey: filterQueryKeys.architecture(),
    queryFn: filtersApi.getArchitecture,
    staleTime: Infinity,
    gcTime: Infinity,
  },
  furniture: {
    queryKey: filterQueryKeys.furniture(),
    queryFn: filtersApi.getFurniture,
    staleTime: Infinity,
    gcTime: Infinity,
  },
  interiorDesigners: {
    queryKey: filterQueryKeys.interiorDesigners(),
    queryFn: filtersApi.getInteriorDesigners,
    staleTime: Infinity,
    gcTime: Infinity,
  },
  roomTypes: {
    queryKey: filterQueryKeys.roomTypes(),
    queryFn: filtersApi.getRoomTypes,
    staleTime: Infinity,
    gcTime: Infinity,
  },
} as const;

export function useGetFilterAngles() {
  return useQuery(queryConfigs.angles);
}

export function useGetFilterArchitects() {
  return useQuery(queryConfigs.architects);
}

export function useGetFilterArchitecture() {
  return useQuery(queryConfigs.architecture);
}

export function useGetFilterFurniture() {
  return useQuery(queryConfigs.furniture);
}

export function useGetFilterInteriorDesigners() {
  return useQuery(queryConfigs.interiorDesigners);
}

export function useGetFilterRoomTypes() {
  return useQuery(queryConfigs.roomTypes);
}
