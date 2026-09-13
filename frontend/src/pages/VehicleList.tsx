import { useState } from "react";
import {
  Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Select, Stack, Table, Text, TextInput, Title, Alert,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useCreateVehicle, useDeleteVehicle, useVehicles } from "../api/hooks";

export default function VehicleList() {
  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [opened, setOpened] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { make: "", model: "", type: "car", year: new Date().getFullYear(), vin: "", purchase_date: "" },
  });

  const submit = form.onSubmit(async (values) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createVehicle.mutateAsync({
        ...values,
        vin: values.vin || undefined,
        purchase_date: values.purchase_date || undefined,
      });
      form.reset();
      setOpened(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Vehicle creation error:", err);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) return <Loader />;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Vehicles</Title>
        <Button onClick={() => setOpened(true)}>+ Add Vehicle</Button>
      </Group>

      <Card withBorder padding={0}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Year</Table.Th><Table.Th>Make</Table.Th><Table.Th>Model</Table.Th>
              <Table.Th>Type</Table.Th><Table.Th>VIN</Table.Th><Table.Th /></Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {vehicles?.map((v) => (
              <Table.Tr key={v.id}>
                <Table.Td>{v.year}</Table.Td>
                <Table.Td>{v.make}</Table.Td>
                <Table.Td>{v.model}</Table.Td>
                <Table.Td><Badge variant="light">{v.type}</Badge></Table.Td>
                <Table.Td>{v.vin ?? "—"}</Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Button size="xs" variant="light" component={Link} to={`/vehicles/${v.id}`}>
                      View
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => {
                        if (confirm(`Delete ${v.make} ${v.model}? Logs and attachments go too.`))
                          deleteVehicle.mutate(v.id);
                      }}
                    >
                      Delete
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Add Vehicle">
        <form onSubmit={submit}>
          <Stack gap="sm">
            {error && (
              <Alert variant="light" color="red" title="Error">
                {error}
              </Alert>
            )}
            <TextInput required label="Make" {...form.getInputProps("make")} />
            <TextInput required label="Model" {...form.getInputProps("model")} />
            <Select
              required
              label="Type"
              data={["car", "motorcycle", "truck", "van", "trailer"]}
              {...form.getInputProps("type")}
            />
            <NumberInput required label="Year" {...form.getInputProps("year")} />
            <TextInput label="VIN (optional)" {...form.getInputProps("vin")} />
            <TextInput
              label="Purchase Date (optional)"
              placeholder="YYYY-MM-DD"
              {...form.getInputProps("purchase_date")}
            />
            <Button type="submit" loading={isSubmitting || createVehicle.isPending}>
              Save
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}