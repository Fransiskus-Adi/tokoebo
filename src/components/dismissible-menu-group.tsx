"use client";

import { type ReactNode, useEffect, useRef } from "react";

export function DismissibleMenuGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenuOnOutsideClick(event: PointerEvent) {
      const openMenu = groupRef.current?.querySelector<HTMLDetailsElement>(
        "details[data-dismissible-menu][open]",
      );
      const target = event.target;

      if (openMenu && target instanceof Node && !openMenu.contains(target)) {
        openMenu.open = false;
      }
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
  }, []);

  return (
    <div ref={groupRef} className={className}>
      {children}
    </div>
  );
}
