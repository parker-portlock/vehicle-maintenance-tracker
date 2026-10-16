import { useState } from "react";
import {
  Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Stack, Table, Text, TextInput, Title, Alert, ActionIcon,
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePart, useUpdatePart, useDeletePart, useParts } from "../api/hooks";

// Define the Part type
interface Part {
  id: string;
  brand: string;
  name: string;
  category: string;
  part_number: string;
  specification: string | null;
  capacity: number | null;
  cost: number | null;
  quantity: number;
  supplier: string | null;
  notes: string | null;
}

// Form values mirror Part exactly (minus the id the backend assigns)
type PartFormValues = Omit<Part, "id">;

export default function Inventory() {
  const [opened, setOpened] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch parts
  const { data: parts, isLoading } = useParts();

  const form = useForm<PartFormValues>({
    initialValues: {
      brand: "",
      name: "",
      category: "",
      part_number: "",
      specification: null,
      capacity: null,
      cost: null,
      quantity: 0,
      supplier: null,
      notes: null,
    },
  });

  // Create part mutation
  const createPart = useCreatePart();

  // Update part mutation
  const updatePart = useUpdatePart();

  // Delete part mutation
  const deletePart = useDeletePart();

  const submit = form.onSubmit(async (values) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Handle empty capacity values by converting to null
      const processedValues = {
        ...values,
        capacity: (values.capacity as string | number | null) === "" ? null : values.capacity
      };

      if (editingPart) {
        await updatePart.mutateAsync({ ...processedValues, id: editingPart.id });
      } else {
        await createPart.mutateAsync(processedValues);
      }
      form.reset();
      setOpened(false);
      setEditingPart(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Part submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleEdit = (part: Part) => {
    setEditingPart(part);
    form.setValues(part);
    setOpened(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this part?")) {
      deletePart.mutate(id);
    }
  };

  // Format currency to always show 2 decimal places
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "—";
    return `$${Number(value).toFixed(2)}`;
  };

  // Format capacity with unit
  const formatCapacity = (value: number | null | undefined, unit?: string): string => {
    if (value === null || value === undefined) return "—";
    return `${Number(value).toFixed(2)}${unit ? ` ${unit}` : ""}`;
  };

  if (isLoading) return <Loader />;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Inventory</Title>
        <Button onClick={() => {
          setEditingPart(null);
          form.reset();
          setOpened(true);
        }}>
          <IconPlus size={16} />
          Add Part
        </Button>
      </Group>

      {error && (
        <Alert variant="light" color="red" title="Error">
          {error}
        </Alert>
      )}

      <Card withBorder padding={0}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Brand</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Part Number</Table.Th>
              <Table.Th>Specification</Table.Th>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>Cost</Table.Th>
              <Table.Th>Quantity</Table.Th>
              <Table.Th>Supplier</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {parts?.map((part) => (
              <Table.Tr key={part.id}>
                <Table.Td>{part.brand}</Table.Td>
                <Table.Td>{part.name}</Table.Td>
                <Table.Td>{part.category}</Table.Td>
                <Table.Td>{part.part_number}</Table.Td>
                <Table.Td>{part.specification ?? "—"}</Table.Td>
                <Table.Td>{formatCapacity(part.capacity, "units")}</Table.Td>
                <Table.Td>{formatCurrency(part.cost)}</Table.Td>
                <Table.Td>{part.quantity}</Table.Td>
                <Table.Td>{part.supplier ?? "—"}</Table.Td>
                <Table.Td>{part.notes ?? "—"}</Table.Td>
                <Table.Td>
                  <Group justify="flex-end" gap="sm">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(part)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(part.id)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            )) ?? (
              <Table.Tr>
                <Table.Td colSpan={11} style={{ textAlign: "center" }}>
                  No parts found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => {
        setOpened(false);
        setEditingPart(null);
        form.reset();
        setError(null);
      }} title={editingPart ? "Edit Part" : "Add New Part"}>
        <form onSubmit={submit}>
          <Stack gap="sm">
            <TextInput
              required
              label="Brand"
              {...form.getInputProps("brand")}
            />
            <TextInput
              required
              label="Name"
              {...form.getInputProps("name")}
            />
            <TextInput
              required
              label="Category"
              {...form.getInputProps("category")}
            />
            <TextInput
              required
              label="Part Number"
              {...form.getInputProps("part_number")}
            />
            <TextInput
              label="Specification"
              {...form.getInputProps("specification")}
            />
            <NumberInput
              label="Capacity"
              {...form.getInputProps("capacity")}
            />
            <NumberInput
              label="Cost"
              {...form.getInputProps("cost")}
            />
            <NumberInput
              required
              label="Quantity"
              {...form.getInputProps("quantity")}
            />
            <TextInput
              label="Supplier"
              {...form.getInputProps("supplier")}
            />
            <TextInput
              label="Notes"
              {...form.getInputProps("notes")}
            />
            <Button type="submit" loading={isSubmitting || createPart.isPending || updatePart.isPending}>
              {editingPart ? "Update Part" : "Add Part"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}