import { useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { ActionIcon, Container, Group, Popover, Stack, Title, Tooltip, UnstyledButton } from "@mantine/core";
import { IconMenu2 } from "@tabler/icons-react";
import Dashboard from "./pages/Dashboard";
import VehicleList from "./pages/VehicleList";
import VehicleDetail from "./pages/VehicleDetail";
import Tasks from "./pages/Tasks";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";
import { MobileToggle, ThemeToggle, VersionWatermark } from "./components";
import { useVehicles } from "./api/hooks";
import { useMobileMode } from "./hooks/useMobileMode";

const ONBOARDING_KEY = "vmt_onboarding_seen";

// Workaround for TypeScript issue with isActive property in Mantine v7
const linkStyle = (isActive: boolean) => ({
  fontWeight: isActive ? 700 : 400,
  textDecoration: "none",
  color: isActive ? "#6d4aff" : "inherit",
});

// Full-width variant for the links inside the mobile (hamburger) menu.
const mobileLinkStyle = (isActive: boolean) => ({
  ...linkStyle(isActive),
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "8px 12px",
  borderRadius: 6,
});

const NAV_LINKS: { to: string; label: string }[] = [
  { to: "/", label: "Dashboard" },
  { to: "/vehicles", label: "Vehicles" },
  { to: "/tasks", label: "Tasks" },
  { to: "/inventory", label: "Inventory" },
  { to: "/settings", label: "Settings" },
];

export default function App() {
  const location = useLocation();
  const { data: vehicles } = useVehicles();
  // Mobile-friendly view (persisted, toggled from the header like the theme).
  const { isMobile, toggle: toggleMobile } = useMobileMode();
  // Open/close state for the mobile hamburger menu.
  const [navOpened, setNavOpened] = useState(false);
  // First-run hint: on the dashboard with no vehicles, point the user
  // to the Vehicles page. Shown once; dismissed permanently on click.
  const [onboarding, setOnboarding] = useState(() => {
    try {
      return localStorage.getItem(ONBOARDING_KEY) === null;
    } catch {
      return true;
    }
  });

  const dismissOnboarding = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* storage unavailable */
    }
    setOnboarding(false);
  };

  return (
    <div className={isMobile ? "vmt-app vmt-app-mobile" : "vmt-app"}>
      <Container size="xl" py="md">
        <Group justify="space-between" mb="xl" wrap="wrap">
          <Group>
            <Title order={3}>🔧 Vehicle Maintenance Tracker</Title>
            <VersionWatermark />
          </Group>
          <Group gap="md" wrap="wrap">
            {!isMobile ? (
              <Group gap="xl" wrap="wrap">
                {NAV_LINKS.map((link) => {
                  const isVehicles = link.to === "/vehicles";
                  const button = (
                    <UnstyledButton
                      key={link.to}
                      component={NavLink}
                      to={link.to}
                      onClick={isVehicles ? () => dismissOnboarding() : undefined}
                      style={(props: any) => linkStyle(props.isActive)}
                    >
                      {link.label}
                    </UnstyledButton>
                  );
                  return isVehicles ? (
                    <Tooltip
                      key={link.to}
                      label="Add your first vehicle"
                      opened={
                        onboarding &&
                        location.pathname === "/" &&
                        vehicles !== undefined &&
                        vehicles.length === 0
                      }
                      withArrow
                      position="bottom"
                    >
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
              </Group>
            ) : (
              <Popover
                opened={navOpened}
                onOpen={() => setNavOpened(true)}
                onClose={() => setNavOpened(false)}
                position="bottom-end"
                zIndex={100}
              >
                <Popover.Target>
                  <ActionIcon variant="subtle" aria-label="Open menu" title="Menu">
                    <IconMenu2 size={20} />
                  </ActionIcon>
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack gap={2}>
                    {NAV_LINKS.map((link) => (
                      <UnstyledButton
                        key={link.to}
                        component={NavLink}
                        to={link.to}
                        onClick={() => {
                          setNavOpened(false);
                          if (link.to === "/vehicles") dismissOnboarding();
                        }}
                        style={(props: any) => mobileLinkStyle(props.isActive)}
                      >
                        {link.label}
                      </UnstyledButton>
                    ))}
                  </Stack>
                </Popover.Dropdown>
              </Popover>
            )}
            <MobileToggle isMobile={isMobile} onToggle={toggleMobile} />
            <ThemeToggle />
          </Group>
        </Group>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Container>
    </div>
  );
}