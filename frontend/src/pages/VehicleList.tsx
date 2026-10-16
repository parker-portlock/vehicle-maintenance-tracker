import { useState } from "react";
import {
  ActionIcon, Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Select, Stack, Table, Text, TextInput, Title, Alert,
} from "@mantine/core";
import { IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useForm } from "@mantine/form";
import {
  useCreateVehicle, useDeleteVehicle, useUpdateVehicle, useVehicles,
} from "../api/hooks";
import type { Vehicle } from "../api/types";

export default function VehicleList() {
  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [opened, setOpened] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: { make: "", model: "", type: "car", year: new Date().getFullYear(), vin: "", purchase_date: "" },
  });

  const resetForm = () => {
    form.reset();
    setEditingVehicle(null);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setOpened(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    form.setValues({
      make: vehicle.make,
      model: vehicle.model,
      type: vehicle.type,
      year: vehicle.year,
      vin: vehicle.vin ?? "",
      purchase_date: vehicle.purchase_date ?? "",
    });
    setEditingVehicle(vehicle);
    setError(null);
    setOpened(true);
  };

  const submit = form.onSubmit(async (values) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        ...values,
        vin: values.vin || null,
        purchase_date: values.purchase_date || null,
      };
      if (editingVehicle) {
        await updateVehicle.mutateAsync({ id: editingVehicle.id, ...payload });
      } else {
        await createVehicle.mutateAsync(payload);
      }
      form.reset();
      setEditingVehicle(null);
      setOpened(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Vehicle creation/editing error:", err);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) return <Loader />;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Vehicles</Title>
        <Button onClick={() => openCreate()}>+ Add Vehicle</Button>
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
                    <ActionIcon
                      variant="light"
                      color="green"
                      component={Link}
                      to={`/vehicles/${v.id}`}
                      aria-label={`View ${v.make} ${v.model}`}
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEdit(v)}
                      aria-label={`Edit ${v.make} ${v.model}`}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label={`Delete ${v.make} ${v.model}`}
                      onClick={() => {
                        if (confirm(`Delete ${v.make} ${v.model}? Logs and attachments go too.`))
                          deleteVehicle.mutate(v.id);
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title={editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
      >
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
            <Button type="submit" loading={isSubmitting || createVehicle.isPending || updateVehicle.isPending}>
              {editingVehicle ? "Update Vehicle" : "Save"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}