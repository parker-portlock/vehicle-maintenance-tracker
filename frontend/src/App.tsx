import { NavLink, Route, Routes } from "react-router-dom";
import { Container, Group, Title, UnstyledButton } from "@mantine/core";
import Dashboard from "./pages/Dashboard";
import VehicleList from "./pages/VehicleList";
import VehicleDetail from "./pages/VehicleDetail";

// Workaround for TypeScript issue with isActive property in Mantine v7
const linkStyle = (isActive: boolean) => ({
  fontWeight: isActive ? 700 : 400,
  textDecoration: "none",
  color: isActive ? "#6d4aff" : "inherit",
});

export default function App() {
  return (
    <>
      <Container size="xl" py="md">
        <Group justify="space-between" mb="xl">
          <Title order={3}>🔧 Vehicle Maintenance Tracker</Title>
          <Group gap="xl">
            <UnstyledButton component={NavLink} to="/" style={({ isActive }) => linkStyle(isActive)}>
              Dashboard
            </UnstyledButton>
            <UnstyledButton component={NavLink} to="/vehicles" style={({ isActive }) => linkStyle(isActive)}>
              Vehicles
            </UnstyledButton>
          </Group>
        </Group>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
        </Routes>
      </Container>
    </>
  );
}