import { Container } from "@/components";
import {
  useGetFilterAngles,
  useGetFilterArchitects,
  useGetFilterArchitecture,
  useGetFilterFurniture,
  useGetFilterInteriorDesigners,
  useGetFilterRoomTypes,
} from "@/hooks/query";

import { Sidebar } from "./components";
import { ChatForm } from "./partials";

export function Project() {
  return (
    <>
      <Container className="self-end">
        <ChatForm>{/* TODO: Add Filters */}</ChatForm>
      </Container>
      <Sidebar className="sm:border-l-px sm:border-l-border" as="aside">
        <Filters />
      </Sidebar>
    </>
  );
}

function Filters() {
  const { data: angles } = useGetFilterAngles();
  const { data: architects } = useGetFilterArchitects();
  const { data: architecture } = useGetFilterArchitecture();
  const { data: furniture } = useGetFilterFurniture();
  const { data: interiorDesigners } = useGetFilterInteriorDesigners();
  const { data: roomTypes } = useGetFilterRoomTypes();

  console.log({
    angles,
    architects,
    architecture,
    furniture,
    interiorDesigners,
    roomTypes,
  });

  return (
    <div>
      <p>Filters</p>
    </div>
  );
}
