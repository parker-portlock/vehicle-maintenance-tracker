import { useLocalStorage } from "@mantine/hooks";

const STORAGE_KEY = "vmt_mobile_view";

// Mobile-friendly view toggle. The preference persists to localStorage (the
// same mechanism the theme uses), so it survives page reloads. App.tsx applies
// the `.vmt-app-mobile` class based on this state to drive the mobile styles
// defined in mobile.css.
export function useMobileMode() {
  const [isMobile, setIsMobile] = useLocalStorage<boolean>({
    key: STORAGE_KEY,
    defaultValue: false,
  });

  return {
    isMobile,
    toggle: () => setIsMobile((prev) => !prev),
  };
}
