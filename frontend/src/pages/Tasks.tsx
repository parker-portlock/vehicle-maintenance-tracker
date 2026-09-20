import { useState } from "react";
import {
  Badge, Button, Card, Group, Loader, Modal, NumberInput,
  Select, Stack, Table, Text, TextInput, Title, Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useTasks, useCreateTask, useDeleteTask } from "../api/hooks";

export default function Tasks() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [opened, setOpened] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      interval_miles: undefined,
      interval_months: undefined,
    },
  });

  const submit = form.onSubmit(async (values) => {
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createTask.mutateAsync(values);
      form.reset();
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
        <Button onClick={() => setOpened(true)}>+ Add Task</Button>
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
                <Table.Td>{t.name}</Table.Td>
                <Table.Td><Text size="sm">{t.description || "—"}</Text></Table.Td>
                <Table.Td>
                  {t.interval_miles !== null && t.interval_miles !== undefined ? (
                    <Badge variant="light">Every {t.interval_miles} miles</Badge>
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td>
                  {t.interval_months !== null && t.interval_months !== undefined ? (
                    <Badge variant="light">Every {t.interval_months} months</Badge>
                  ) : (
                    "—"
                  )}
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
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
                      Delete
                    </Button>
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
          form.reset();
        }}
        title="Add Task"
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
            <Button type="submit" loading={isSubmitting || createTask.isPending}>
              Add Task
            </Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}