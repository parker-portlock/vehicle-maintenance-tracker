import { ActionIcon } from "@mantine/core";
import { IconDeviceDesktop, IconDeviceMobile } from "@tabler/icons-react";

interface MobileToggleProps {
  isMobile: boolean;
  onToggle: () => void;
}

// Switches between the desktop and mobile-friendly views. Styled like the
// dark/light ThemeToggle so it reads as a sibling setting. The icon and label
// reflect the state you would switch TO.
export default function MobileToggle({ isMobile, onToggle }: MobileToggleProps) {
  const label = isMobile ? "Switch to desktop view" : "Switch to mobile view";

  return (
    <ActionIcon
      variant={isMobile ? "light" : "subtle"}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      {isMobile ? <IconDeviceDesktop size={18} /> : <IconDeviceMobile size={18} />}
    </ActionIcon>
  );
}
