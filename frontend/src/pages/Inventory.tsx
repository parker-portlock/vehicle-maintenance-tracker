import { useMemo, useState } from "react";
import {
  Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Select, Stack, Table, Text, TextInput, Title, Alert, ActionIcon,
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useQueryClient } from "@tanstack/react-query";
import { useCreatePart, useUpdatePart, useDeletePart, useParts } from "../api/hooks";
import SortableTh from "../components/SortableTh";
import { sortRows, useTableSort } from "../hooks/useTableSort";
import { useUnits } from "../hooks/useUnits";
import {
  toDisplayCapacity,
  toCanonicalCapacity,
  formatCapacity,
  type CapacityType,
} from "../utils/units";

// Define the Part type
interface Part {
  id: string;
  brand: string;
  name: string;
  category: string;
  part_number: string;
  specification: string | null;
  capacity: number | null;
  capacity_unit: string | null;
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

  // Imperial/Metric preference from Settings; drives the capacity unit
  // options and the live conversion of stored capacities.
  const { units } = useUnits();

  // Column sorting for the parts table (click a header to toggle)
  const { sort, toggleSort } = useTableSort();

  const form = useForm<PartFormValues>({
    initialValues: {
      brand: "",
      name: "",
      category: "",
      part_number: "",
      specification: null,
      capacity: null,
      capacity_unit: null,
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
      // Capacity is entered in the user's display unit (L/kg or qt/lbs) and,
      // when a unit is chosen, stored in the canonical metric unit (L or kg).
      // With no unit selected the number is stored as-is with a null unit.
      const rawCapacity = values.capacity as string | number | null;
      const hasCapacity =
        rawCapacity !== "" && rawCapacity !== null && rawCapacity !== undefined;
      const selectedType = values.capacity_unit as CapacityType | null;
      let capacity: number | null = null;
      let capacity_unit: string | null = null;
      if (hasCapacity) {
        const value = Number(rawCapacity);
        if (selectedType === "L" || selectedType === "kg") {
          capacity = toCanonicalCapacity(value, selectedType, units);
          capacity_unit = selectedType;
        } else {
          capacity = value;
          capacity_unit = null;
        }
      }
      const processedValues = {
        ...values,
        capacity,
        capacity_unit,
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
    // Show the capacity in the user's current unit; the stored value is in
    // the canonical metric unit (L or kg), so convert for display.
    const type =
      part.capacity_unit === "L" || part.capacity_unit === "kg"
        ? (part.capacity_unit as CapacityType)
        : null;
    form.setValues({
      ...part,
      capacity:
        part.capacity == null || type === null
          ? part.capacity
          : toDisplayCapacity(part.capacity, type, units),
      capacity_unit: type ?? null,
    });
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

  // Sort value for each inventory column (null sorts last)
  const partSortValue = (part: Part, key: string | null): string | number | null => {
    switch (key) {
      case "brand":
        return part.brand;
      case "name":
        return part.name;
      case "category":
        return part.category;
      case "partNumber":
        return part.part_number;
      case "specification":
        return part.specification;
      case "capacity":
        return part.capacity;
      case "cost":
        return part.cost;
      case "quantity":
        return part.quantity;
      case "supplier":
        return part.supplier;
      default:
        return null;
    }
  };

  const displayedParts = useMemo(
    () => sortRows(parts ?? [], sort, (part) => partSortValue(part, sort.key)),
    [parts, sort]
  );

  const th = (label: string, sortKey: string) => (
    <SortableTh label={label} sortKey={sortKey} activeKey={sort.key} direction={sort.direction} onSort={toggleSort} />
  );

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
              {th("Brand", "brand")}
              {th("Name", "name")}
              {th("Category", "category")}
              {th("Part Number", "partNumber")}
              {th("Specification", "specification")}
              {th("Capacity", "capacity")}
              {th("Cost", "cost")}
              {th("Quantity", "quantity")}
              {th("Supplier", "supplier")}
              <Table.Th>Notes</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {displayedParts.map((part) => (
              <Table.Tr key={part.id}>
                <Table.Td data-label="Brand">{part.brand}</Table.Td>
                <Table.Td data-label="Name">{part.name}</Table.Td>
                <Table.Td data-label="Category">{part.category}</Table.Td>
                <Table.Td data-label="Part Number">{part.part_number}</Table.Td>
                <Table.Td data-label="Specification">{part.specification ?? "—"}</Table.Td>
                <Table.Td data-label="Capacity">
                  {formatCapacity(part.capacity, part.capacity_unit as CapacityType | null, units)}
                </Table.Td>
                <Table.Td data-label="Cost">{formatCurrency(part.cost)}</Table.Td>
                <Table.Td data-label="Quantity">{part.quantity}</Table.Td>
                <Table.Td data-label="Supplier">{part.supplier ?? "—"}</Table.Td>
                <Table.Td data-label="Notes">{part.notes ?? "—"}</Table.Td>
                <Table.Td data-label="">
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
            <Select
              label="Unit (optional)"
              placeholder="None"
              clearable
              data={
                units === "metric"
                  ? [
                      { value: "L", label: "L" },
                      { value: "kg", label: "kg" },
                    ]
                  : [
                      { value: "L", label: "qt" },
                      { value: "kg", label: "lbs" },
                    ]
              }
              {...form.getInputProps("capacity_unit")}
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