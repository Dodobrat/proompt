import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Portal({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) {
  const [el, setEl] = useState<HTMLElement | null>(() =>
    id ? document.getElementById(id) : null,
  );

  useEffect(() => {
    if (!id) return;
    const el = document.getElementById(id);
    setEl(el);
  }, [id]);

  if (!el) {
    return createPortal(children, document.body);
  }

  return createPortal(children, el);
}
