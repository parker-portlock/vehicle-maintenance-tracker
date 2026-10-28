import { useState } from "react";
import {
  ActionIcon, Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Select, Stack, Table, Text, TextInput, Title, Alert,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../api/hooks";
import type { MaintenanceTask } from "../api/types";

type TaskFormValues = {
  name: string;
  description: string;
  interval_miles: number | undefined;
  interval_months: number | undefined;
};

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [opened, setOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TaskFormValues>({
    initialValues: {
      name: "",
      description: "",
      interval_miles: undefined,
      interval_months: undefined,
    },
  });

  const resetForm = () => {
    form.reset();
    setEditingTask(null);
    setError(null);
  };

  const openCreate = () => {
    resetForm();
    setOpened(true);
  };

  const openEdit = (task: MaintenanceTask) => {
    form.setValues({
      name: task.name,
      description: task.description ?? "",
      interval_miles: task.interval_miles ?? undefined,
      interval_months: task.interval_months ?? undefined,
    });
    setEditingTask(task);
    setError(null);
    setOpened(true);
  };

  const submit = form.onSubmit(async (values) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (editingTask) {
        await updateTask.mutateAsync({ id: editingTask.id, ...values });
      } else {
        await createTask.mutateAsync(values);
      }
      form.reset();
      setEditingTask(null);
      setOpened(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      console.error("Task creation/editing error:", err);
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading) return <Loader />;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>📋 Maintenance Tasks</Title>
        <Button onClick={() => openCreate()}>+ Add Task</Button>
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
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Interval (Miles)</Table.Th>
              <Table.Th>Interval (Months)</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tasks?.map((t) => (
              <Table.Tr key={t.id}>
                <Table.Td data-label="Name">{t.name}</Table.Td>
                <Table.Td data-label="Description"><Text size="sm">{t.description || "—"}</Text></Table.Td>
                <Table.Td data-label="Interval (Miles)">
                  {t.interval_miles !== null && t.interval_miles !== undefined ? (
                    <Badge variant="light">Every {t.interval_miles} miles</Badge>
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td data-label="Interval (Months)">
                  {t.interval_months !== null && t.interval_months !== undefined ? (
                    <Badge variant="light">Every {t.interval_months} months</Badge>
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td data-label="">
                  <Group justify="flex-end">
                    <ActionIcon
                      variant="light"
                      onClick={() => openEdit(t)}
                      aria-label={`Edit ${t.name}`}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      aria-label={`Delete ${t.name}`}
                      onClick={async () => {
                        if (
                          confirm(
                            `Delete task "${t.name}"?\n\nNote: This task can only be deleted if it's not referenced by any maintenance logs.`
                          )
                        ) {
                          try {
                            await deleteTask.mutateAsync(t.id);
                          } catch (err) {
                            alert(
                              err instanceof Error ? err.message : "Failed to delete task. It may be referenced by maintenance logs."
                            );
                          }
                        }
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {(!tasks || tasks.length === 0) && (
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td colSpan={5} align="center">
                    No maintenance tasks found. Click "Add Task" to create one.
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          resetForm();
        }}
        title={editingTask ? "Edit Task" : "Add Task"}
      >
        <form onSubmit={submit}>
          <Stack gap="sm">
            {error && (
              <Alert variant="light" color="red" title="Error">
                {error}
              </Alert>
            )}
            <TextInput
              required
              label="Task Name"
              placeholder="e.g., Oil Change, Tire Rotation"
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Description (optional)"
              placeholder="Enter task description or purpose..."
              {...form.getInputProps("description")}
            />
            <Group gap="md">
              <NumberInput
                label="Interval in Miles (optional)"
                placeholder="e.g., 5000"
                {...form.getInputProps("interval_miles")}
              />
              <NumberInput
                label="Interval in Months (optional)"
                placeholder="e.g., 6"
                {...form.getInputProps("interval_months")}
              />
            </Group>
            <Button type="submit" loading={isSubmitting || createTask.isPending || updateTask.isPending}>
              {editingTask ? "Update Task" : "Add Task"}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}