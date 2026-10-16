import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export default function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <ActionIcon
      variant="subtle"
      aria-label={label}
      title={label}
      onClick={() => setColorScheme(isDark ? "light" : "dark")}
    >
      {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </ActionIcon>
  );
}
