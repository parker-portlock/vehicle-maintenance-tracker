import { useState } from "react";
import {
  Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Stack, Table, Text, TextInput, Title, Alert, ActionIcon,
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api/client";
import { useCreatePart, useUpdatePart, useDeletePart, useParts } from "../api/hooks";

// Define the Part type
interface Part {
  id: string;
  name: string;
  quantity: number;
  supplier: string | null;
  cost: number | null;
  notes: string | null;
}

export default function Inventory() {
  const [opened, setOpened] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  // Fetch parts
  const { data: parts, isLoading } = useParts();
  
  const form = useForm({
    initialValues: {
      name: "",
      quantity: 0,
      supplier: "",
      cost: null,
      notes: "",
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
      if (editingPart) {
        await updatePart.mutateAsync({ ...values, id: editingPart.id });
      } else {
        await createPart.mutateAsync(values);
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
                <Table.Td>{part.capacity?.toFixed(2) ?? "—"}</Table.Td>
                <Table.Td>${part.cost?.toFixed(2) ?? "—"}</Table.Td>
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
              label="Specification (optional)" 
              {...form.getInputProps("specification")} 
            />
            <NumberInput 
              label="Capacity (optional)" 
              {...form.getInputProps("capacity")} 
            />
            <NumberInput 
              label="Cost (optional)" 
              {...form.getInputProps("cost")} 
            />
            <NumberInput 
              required 
              label="Quantity" 
              {...form.getInputProps("quantity")} 
            />
            <TextInput 
              label="Supplier (optional)" 
              {...form.getInputProps("supplier")} 
            />
            <TextInput 
              label="Notes (optional)" 
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