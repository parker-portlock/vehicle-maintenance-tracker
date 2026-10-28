import { useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Container, Group, Title, Tooltip, UnstyledButton } from "@mantine/core";
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

export default function App() {
  const location = useLocation();
  const { data: vehicles } = useVehicles();
  // Mobile-friendly view (persisted, toggled from the header like the theme).
  const { isMobile, toggle: toggleMobile } = useMobileMode();
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
          <Group gap="xl">
            <UnstyledButton component={NavLink} to="/" style={(props: any) => linkStyle(props.isActive)}>
              Dashboard
            </UnstyledButton>
            <Tooltip
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
              <UnstyledButton
                component={NavLink}
                to="/vehicles"
                onClick={() => dismissOnboarding()}
                style={(props: any) => linkStyle(props.isActive)}
              >
                Vehicles
              </UnstyledButton>
            </Tooltip>
            <UnstyledButton component={NavLink} to="/tasks" style={(props: any) => linkStyle(props.isActive)}>
              Tasks
            </UnstyledButton>
            <UnstyledButton component={NavLink} to="/inventory" style={(props: any) => linkStyle(props.isActive)}>
              Inventory
            </UnstyledButton>
            <UnstyledButton component={NavLink} to="/settings" style={(props: any) => linkStyle(props.isActive)}>
              Settings
            </UnstyledButton>
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