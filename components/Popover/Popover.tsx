// components/Popover.tsx
import PopoverClient from "./PopoverClient";

export default function Popover({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <PopoverClient trigger={trigger}>
      {children}
    </PopoverClient>
  );
}
