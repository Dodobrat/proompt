import { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { useEventListener } from "usehooks-ts";

import { useLocalStorage } from "@/hooks";
import { DB } from "@/lib/db";
import { cn } from "@/lib/utils";

export enum ResizeDirection {
  LeftToRight = "ltr",
  RightToLeft = "rtl",
}

const SIDEBAR_WIDTH_CSS_VAR = "--sidebar-width";
const DEFAULT_SIDEBAR_WIDTH = 380;

function numberToPx(number: number) {
  if (!number) return "0px";
  return `${parseInt(number.toString())}px`;
}

function pxToNumber(px: string) {
  if (!px) return 0;
  return parseInt(px.replace("px", ""));
}

type SidebarProps = {
  children?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  resizeOptions?: {
    minWidth: number;
    maxWidth: number;
    direction: ResizeDirection;
    storageKey?: string;
  };
};

export function Sidebar({
  children,
  className,
  resizeOptions,
  as: Component = "nav",
}: SidebarProps) {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const resizeDir = resizeOptions?.direction ?? ResizeDirection.LeftToRight;
  const storeKey = resizeOptions?.storageKey ?? DB.KEYS.FILTERS_SIDEBAR_WIDTH;

  const [isResizing, setIsResizing] = useState(false);
  const { value: storedSidebarWidth, setValue: setStoredSidebarWidth } =
    useLocalStorage(storeKey, DEFAULT_SIDEBAR_WIDTH);

  const isResizable = resizeOptions !== undefined;
  const DRAG_HANDLE_ID = `drag-handle-${resizeDir}-${storeKey}`;

  const onStartResizing = () => {
    if (!isResizable) return;

    setIsResizing(true);

    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  };

  const onResizing = (event: PointerEvent | TouchEvent) => {
    if (!isResizable) return;
    if (!isResizing) return;

    const windowWidth = window.innerWidth;
    const sidebarWidth =
      event instanceof PointerEvent ? event.clientX : event.touches[0].clientX;

    let diff = 0;

    if (resizeOptions.direction === ResizeDirection.LeftToRight) {
      diff = sidebarWidth;
    }
    if (resizeOptions.direction === ResizeDirection.RightToLeft) {
      diff = windowWidth - sidebarWidth;
    }

    if (diff <= resizeOptions.minWidth) return;
    if (diff >= resizeOptions.maxWidth) return;

    if (!sidebarRef.current) return;

    sidebarRef.current.style.setProperty(
      SIDEBAR_WIDTH_CSS_VAR,
      numberToPx(diff),
    );
  };

  const onEndResizing = () => {
    if (!isResizable) return;
    if (!isResizing) return;

    setIsResizing(false);

    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    if (!sidebarRef.current) return;

    const finalSidebarWidth = sidebarRef.current.style.getPropertyValue(
      SIDEBAR_WIDTH_CSS_VAR,
    );
    setStoredSidebarWidth(pxToNumber(finalSidebarWidth));
  };

  useEventListener("pointerdown", onStartResizing, dragHandleRef);
  useEventListener("touchstart", onStartResizing, dragHandleRef, {
    passive: true,
  });

  useEventListener("pointermove", onResizing, undefined, { passive: true });
  useEventListener("touchmove", onResizing, undefined, { passive: true });

  useEventListener("pointerup", onEndResizing);
  useEventListener("touchend", onEndResizing);
  useEventListener("touchcancel", onEndResizing);

  return (
    <Component
      style={{ [SIDEBAR_WIDTH_CSS_VAR]: numberToPx(storedSidebarWidth) }}
      className={cn(
        "sticky top-16 h-[calc(100vh_-_4rem)] overflow-hidden bg-card",
        !isResizable && "w-full max-w-sm",
        isResizable &&
          "w-[var(--sidebar-width)] shrink-0 basis-[var(--sidebar-width)]",
        className,
      )}
      ref={sidebarRef}
    >
      <div className="h-full overflow-auto">{children}</div>
      <div
        ref={dragHandleRef}
        id={DRAG_HANDLE_ID}
        className={cn(
          "fixed bottom-0 h-[calc(100vh_-_4rem)] w-1 cursor-ew-resize bg-primary/75",
          "grid place-content-center transition-opacity delay-300 hover:opacity-100 hover:delay-0",
          !isResizing && "opacity-0",
          isResizing && "opacity-100",
          resizeDir === ResizeDirection.LeftToRight &&
            "left-[calc(var(--sidebar-width)_-_0.25rem)]",
          resizeDir === ResizeDirection.RightToLeft &&
            "right-[calc(var(--sidebar-width)_-_0.25rem)]",
        )}
      >
        <GripVertical className="h-8 w-4 rounded-lg bg-primary text-primary-foreground" />
      </div>
    </Component>
  );
}
