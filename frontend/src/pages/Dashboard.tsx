import { Card, Grid, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { useVehicles } from "../api/hooks";

export default function Dashboard() {
  const { data: vehicles, isLoading } = useVehicles();

  if (isLoading) return <Loader />;

  const totalVehicles = vehicles?.length ?? 0;
  const oldest = vehicles?.[0];

  return (
    <Stack gap="lg">
      <Title order={2}>Dashboard</Title>
      <SimpleGrid cols={3}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed">Total Vehicles</Text>
          <Text fz={32} fw={700}>{totalVehicles}</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed">Types</Text>
          <Text fz={32} fw={700}>
            {new Set(vehicles?.map((v) => v.type)).size}
          </Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text size="sm" c="dimmed">Newest Vehicle</Text>
          <Text fz="lg" fw={600}>
            {vehicles?.length
              ? [...vehicles].pop()?.year + " " + [...vehicles].pop()?.make
              : "—"}
          </Text>
        </Card>
      </SimpleGrid>
      <Grid>
        <Grid.Col span={6}>
          <Card withBorder padding="lg">
            <Title order={4} mb="sm">Garage</Title>
            {vehicles?.map((v) => (
              <Text key={v.id} component={Link} to={`/vehicles/${v.id}`} td="underline">
                {v.year} {v.make} {v.model} ({v.type})
              </Text>
            )) ?? <Text c="dimmed">No vehicles yet</Text>}
          </Card>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}