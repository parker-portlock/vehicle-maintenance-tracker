import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge, Button, Card, Group, Loader, Modal, NativeSelect,
  NumberInput, Stack, Table, Text, Textarea, TextInput, Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  useCreateLog, useCreateTask, useTasks, useVehicle, useVehicleLogs,
} from "../api/hooks";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading: vLoading } = useVehicle(id!);
  const { data: logs, isLoading: lLoading } = useVehicleLogs(id!);
  const { data: tasks } = useTasks();
  const createLog = useCreateLog(id!);
  const createTask = useCreateTask();
  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      task_id: "", mileage: 0, performed_on: "", cost: "", notes: "",
      parts_used: "",
    },
  });

  const taskOptions = useMemo(
    () => (tasks ?? []).map((t) => ({ value: t.id, label: t.name })),
    [tasks]
  );

  const totalSpend = useMemo(
    () => (logs ?? []).reduce((sum, l) => sum + (l.cost ? Number(l.cost) : 0), 0),
    [logs]
  );

  const latestMileage = useMemo(() => {
    const sorted = [...(logs ?? [])].sort((a, b) => b.mileage - a.mileage);
    return sorted[0]?.mileage;
  }, [logs]);

  const submit = form.onSubmit(async (values) => {
    let task_id = values.task_id;
    // "new:<name>" is the create-new-task option - this will be handled by the backend
    if (task_id && task_id.startsWith("new:")) {
      const name = task_id.slice(4);
      const task = await createTask.mutateAsync({ name });
      task_id = task.id;
    }
    
    // If we're using task_name instead of task_id, we'll pass it directly to backend
    let parts: unknown[] | undefined;
    if (values.parts_used.trim()) {
      parts = values.parts_used
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, qty] = line.split("|").map((s) => s.trim());
          return { name, qty };
        });
    }
    
    // Validate that we have a proper task_id
    if (!task_id) {
      alert("Please select a valid task before submitting");
      return;
    }
    
    await createLog.mutateAsync({
      task_id,
      mileage: values.mileage,
      performed_on: values.performed_on,
      cost: values.cost ? Number(values.cost) : undefined,
      notes: values.notes || undefined,
      parts_used: parts,
    });
    
    form.reset();
    setOpened(false);
  });

  if (vLoading || lLoading) return <Loader />;
  if (!vehicle) return <Text>Vehicle not found</Text>;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={2}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Title>
          <Group mt="xs">
            <Badge variant="light">{vehicle.type}</Badge>
            {latestMileage !== undefined && (
              <Badge variant="outline" color="grape">{latestMileage.toLocaleString()} mi</Badge>
            )}
            <Badge variant="outline" color="teal">${totalSpend.toFixed(2)} spent</Badge>
          </Group>
        </div>
        <Button onClick={() => setOpened(true)}>+ Log Maintenance</Button>
      </Group>

      <Card withBorder padding={0}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th><Table.Th>Task</Table.Th><Table.Th>Mileage</Table.Th>
              <Table.Th>Cost</Table.Th><Table.Th>Notes</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs?.map((log) => (
              <Table.Tr key={log.id}>
                <Table.Td>{log.performed_on}</Table.Td>
                <Table.Td>{log.task.name}</Table.Td>
                <Table.Td>{log.mileage.toLocaleString()}</Table.Td>
                <Table.Td>{log.cost ? `$${Number(log.cost).toFixed(2)}` : "—"}</Table.Td>
                <Table.Td>
                  {log.notes}
                  {log.parts_used?.items?.length ? (
                    <Text size="xs" c="dimmed">
                      Parts: {log.parts_used.items.map((p) => `${p.name} ×${p.qty ?? 1}`).join(", ")}
                    </Text>
                  ) : null}
                </Table.Td>
              </Table.Tr>
            ))}
            {!logs?.length && (
              <Table.Tr><Table.Td colSpan={5}><Text c="dimmed">No maintenance logged yet</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <Modal opened={opened} onClose={() => setOpened(false)} title="Log Maintenance" size="lg">
        <form onSubmit={submit}>
          <Stack gap="sm">
            <NativeSelect
              required
              label="Task"
              data={[
                ...taskOptions,
                ...["Oil Change", "Tire Rotation", "Chain Lube", "Brake Service"]
                  .filter((n) => !tasks?.some((t) => t.name === n))
                  .map((n) => ({ value: `new:${n}`, label: `+ New: ${n}` })),
              ]}
              {...form.getInputProps("task_id")}
            />
            <NumberInput required label="Mileage" min={0} {...form.getInputProps("mileage")} />
            <TextInput
              required
              label="Performed On"
              placeholder="YYYY-MM-DD"
              {...form.getInputProps("performed_on")}
            />
            <NumberInput label="Cost ($)" min={0} decimalScale={2} {...form.getInputProps("cost")} />
            <Textarea label="Notes" autosize minRows={2} {...form.getInputProps("notes")} />
            <Textarea
              label="Parts Used"
              description="One per line: Name | Qty"
              placeholder={"Mobil 1 15W-50 | 4 qt\nK&N KN-204 | 1"}
              autosize
              minRows={2}
              {...form.getInputProps("parts_used")}
            />
            <Button type="submit" loading={createLog.isPending}>Save</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}