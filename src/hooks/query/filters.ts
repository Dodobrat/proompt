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

export function useGetFilterAngles() {
  return useQuery({
    queryKey: filterQueryKeys.angles(),
    queryFn: filtersApi.getAngles,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetFilterArchitects() {
  return useQuery({
    queryKey: filterQueryKeys.architects(),
    queryFn: filtersApi.getArchitects,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetFilterArchitecture() {
  return useQuery({
    queryKey: filterQueryKeys.architecture(),
    queryFn: filtersApi.getArchitecture,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetFilterFurniture() {
  return useQuery({
    queryKey: filterQueryKeys.furniture(),
    queryFn: filtersApi.getFurniture,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetFilterInteriorDesigners() {
  return useQuery({
    queryKey: filterQueryKeys.interiorDesigners(),
    queryFn: filtersApi.getInteriorDesigners,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetFilterRoomTypes() {
  return useQuery({
    queryKey: filterQueryKeys.roomTypes(),
    queryFn: filtersApi.getRoomTypes,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useGetAllFilters() {
  const angles = useGetFilterAngles();
  const architects = useGetFilterArchitects();
  const architecture = useGetFilterArchitecture();
  const furniture = useGetFilterFurniture();
  const interiorDesigners = useGetFilterInteriorDesigners();
  const roomTypes = useGetFilterRoomTypes();

  return {
    angles,
    architects,
    architecture,
    furniture,
    interiorDesigners,
    roomTypes,
  };
}
