import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ActionIcon, Badge, Button, Card, Group, Loader, Modal, NativeSelect,
  NumberInput, Select, Stack, Table, Text, Textarea, Title,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import {
  useCreateLog, useCreateTask, useDeleteLog, useParts, useTasks, useUpdateLog, useVehicle, useVehicleLogs,
} from "../api/hooks";
import type { LogPartRef, MaintenanceLog, Part } from "../api/types";
import SpendChart from "../components/SpendChart";
import SortableTh from "../components/SortableTh";
import { sortRows, useTableSort } from "../hooks/useTableSort";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading: vLoading } = useVehicle(id!);
  const { data: logs, isLoading: lLoading } = useVehicleLogs(id!);
  const { data: tasks } = useTasks();
  const createLog = useCreateLog(id!);
  const updateLog = useUpdateLog(id!);
  const deleteLog = useDeleteLog(id!);
  const createTask = useCreateTask();
  const { data: parts } = useParts();
  // Column sorting for the log table (click a header to toggle)
  const { sort, toggleSort } = useTableSort();
  const [opened, setOpened] = useState(false);
  const [editingLog, setEditingLog] = useState<MaintenanceLog | null>(null);

  // Inventory parts used in this log (managed outside the Mantine form)
  const [selectedParts, setSelectedParts] = useState<LogPartRef[]>([]);
  // The part currently being picked + its quantity in the "add" row
  const [partToAdd, setPartToAdd] = useState<string | null>(null);
  const [partQty, setPartQty] = useState<number>(1);

  const partById = new Map<string, Part>((parts ?? []).map((p) => [p.id, p]));
  const partOptions = (parts ?? []).map((p) => ({
    value: p.id,
    // Zero-stock parts are grayed out, marked unavailable, and not selectable
    label: `${p.brand} ${p.name}${p.quantity === 0 ? " (Not Available)" : ""}`,
    disabled: p.quantity === 0,
  }));

  const form = useForm({
    initialValues: {
      task_id: "", mileage: 0, performed_on: null as Date | null,
      cost: "", labor_cost: "", notes: "",
    },
    validate: {
      performed_on: (value) => (value == null ? "Select the date performed" : null),
    },
  });

  const taskOptions = useMemo(
    () => (tasks ?? []).map((t) => ({ value: t.id, label: t.name })),
    [tasks]
  );

  // A log's inventory parts cost: each used part's inventory cost × quantity.
  // Parts with a null cost count as 0; a null quantity counts as 1.
  const partsCostForLog = (log: MaintenanceLog): number =>
    (log.parts_used ?? []).reduce((sum, lp) => {
      const part = partById.get(lp.id);
      return sum + (part?.cost ?? 0) * (lp.quantity ?? 1);
    }, 0);

  // Total parts cost for a log: inventory parts cost + additional parts cost (log.cost)
  const logPartsTotal = (log: MaintenanceLog): number =>
    partsCostForLog(log) + (log.cost ? Number(log.cost) : 0);

  // Sort value for each log table column (null sorts last)
  const logSortValue = (log: MaintenanceLog, key: string | null): string | number | null => {
    switch (key) {
      case "date":
        return log.performed_on;
      case "task":
        return log.task.name;
      case "mileage":
        return log.mileage;
      case "partsCost":
        return logPartsTotal(log);
      case "laborCost":
        return log.labor_cost != null ? Number(log.labor_cost) : null;
      default:
        return null;
    }
  };

  const displayedLogs = useMemo(
    () => sortRows(logs ?? [], sort, (log) => logSortValue(log, sort.key)),
    [logs, sort]
  );

  const th = (label: string, sortKey: string) => (
    <SortableTh label={label} sortKey={sortKey} activeKey={sort.key} direction={sort.direction} onSort={toggleSort} />
  );

  // Live parts cost shown in the form while parts are being selected
  const formPartsCost = selectedParts.reduce((sum, lp) => {
    const part = partById.get(lp.id);
    return sum + (part?.cost ?? 0) * (lp.quantity ?? 1);
  }, 0);

  // "Parts Spent" includes both the inventory parts cost and the additional parts cost
  const partsSpend = useMemo(
    () => (logs ?? []).reduce((sum, l) => sum + logPartsTotal(l), 0),
    [logs, parts]
  );
  const laborSpend = useMemo(
    () => (logs ?? []).reduce((sum, l) => sum + (l.labor_cost ? Number(l.labor_cost) : 0), 0),
    [logs]
  );
  const totalSpend = useMemo(() => partsSpend + laborSpend, [partsSpend, laborSpend]);

  const latestMileage = useMemo(() => {
    const sorted = [...(logs ?? [])].sort((a, b) => b.mileage - a.mileage);
    return sorted[0]?.mileage;
  }, [logs]);

  const addPart = () => {
    if (!partToAdd) return;
    const qty = partQty ?? 1;
    setSelectedParts((prev) => {
      const existing = prev.find((p) => p.id === partToAdd);
      if (existing) {
        return prev.map((p) => (p.id === partToAdd ? { ...p, quantity: qty } : p));
      }
      return [...prev, { id: partToAdd, quantity: qty }];
    });
    setPartToAdd(null);
    setPartQty(1);
  };

  const removePart = (id: string) =>
    setSelectedParts((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id: string, qty: number | string | undefined) =>
    setSelectedParts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: qty === undefined ? null : Number(qty) } : p
      )
    );

  const resetParts = () => {
    setSelectedParts([]);
    setPartToAdd(null);
    setPartQty(1);
  };

  const openCreate = () => {
    setEditingLog(null);
    form.reset();
    resetParts();
    setOpened(true);
  };

  const openEdit = (log: MaintenanceLog) => {
    setEditingLog(log);
    form.setValues({
      task_id: log.task.id,
      mileage: log.mileage,
      performed_on: dayjs(log.performed_on).toDate(),
      cost: log.cost != null ? String(log.cost) : "",
      labor_cost: log.labor_cost != null ? String(log.labor_cost) : "",
      notes: log.notes ?? "",
    });
    setSelectedParts(
      (log.parts_used ?? []).map((p) => ({ id: p.id, quantity: p.quantity }))
    );
    setPartToAdd(null);
    setPartQty(1);
    setOpened(true);
  };

  const handleDeleteLog = (log: MaintenanceLog) => {
    if (
      confirm(
        `Delete this "${log.task.name}" log?\n\nParts used in this log will be returned to inventory.`
      )
    ) {
      deleteLog.mutate(log.id);
    }
  };

  const submit = form.onSubmit(async (values) => {
    if (!values.performed_on) return;
    // DatePickerInput stores a plain JS Date in the form; dayjs() normalizes Date/Dayjs/string
    const performedOn = dayjs(values.performed_on).format("YYYY-MM-DD");
    let task_id = values.task_id;
    // "new:<name>" is the create-new-task option - this will be handled by the backend
    if (task_id && task_id.startsWith("new:")) {
      const name = task_id.slice(4);
      const task = await createTask.mutateAsync({ name });
      task_id = task.id;
    }
    
    // Validate that we have a proper task_id
    if (!task_id) {
      alert("Please select a valid task before submitting");
      return;
    }
    
    if (editingLog) {
      await updateLog.mutateAsync({
        logId: editingLog.id,
        task_id,
        mileage: values.mileage,
        performed_on: performedOn,
        // Send explicit null for cleared fields: a key omitted from the body
        // leaves the existing value unchanged on the backend
        cost: values.cost ? Number(values.cost) : null,
        labor_cost: values.labor_cost ? Number(values.labor_cost) : null,
        notes: values.notes || null,
        // Always send parts in edit mode so removals are applied to the log
        parts_used: selectedParts,
      });
    } else {
      await createLog.mutateAsync({
        task_id,
        mileage: values.mileage,
        performed_on: performedOn,
        cost: values.cost ? Number(values.cost) : undefined,
        labor_cost: values.labor_cost ? Number(values.labor_cost) : undefined,
        notes: values.notes || undefined,
        parts_used: selectedParts.length ? selectedParts : null,
      });
    }
    
    setEditingLog(null);
    form.reset();
    resetParts();
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
            <Badge variant="outline" color="teal">Total Spent: ${totalSpend.toFixed(2)}</Badge>
            <Badge variant="outline" color="blue">Parts Spent: ${partsSpend.toFixed(2)}</Badge>
            <Badge variant="outline" color="violet">Labor Spent: ${laborSpend.toFixed(2)}</Badge>
          </Group>
        </div>
        <Button onClick={() => openCreate()}>+ Log Maintenance</Button>
      </Group>

      <Card withBorder padding={0}>
        <Table>
          <Table.Thead>
            <Table.Tr>
              {th("Date", "date")}{th("Task", "task")}{th("Mileage", "mileage")}
              {th("Parts Cost", "partsCost")}{th("Labor Cost", "laborCost")}
              <Table.Th>Parts Used</Table.Th><Table.Th>Notes</Table.Th><Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {displayedLogs.map((log) => (
              <Table.Tr key={log.id}>
                <Table.Td data-label="Date">{log.performed_on}</Table.Td>
                <Table.Td data-label="Task">{log.task.name}</Table.Td>
                <Table.Td data-label="Mileage">{log.mileage.toLocaleString()}</Table.Td>
                <Table.Td data-label="Parts Cost">{logPartsTotal(log) > 0 ? `$${logPartsTotal(log).toFixed(2)}` : "—"}</Table.Td>
                <Table.Td data-label="Labor Cost">{log.labor_cost ? `$${Number(log.labor_cost).toFixed(2)}` : "—"}</Table.Td>
                <Table.Td data-label="Parts Used">
                  {log.parts_used?.length
                    ? log.parts_used.map((p) => (
                        <span key={p.id} style={{ display: "block" }}>
                          {`${p.brand} ${p.name} ×${p.quantity ?? 1}`}
                        </span>
                      ))
                    : "—"}
                </Table.Td>
                <Table.Td data-label="Notes">{log.notes}</Table.Td>
                <Table.Td data-label="">
                  <Group justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => openEdit(log)}
                      aria-label={`Edit ${log.task.name} log`}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDeleteLog(log)}
                      aria-label={`Delete ${log.task.name} log`}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!logs?.length && (
              <Table.Tr><Table.Td colSpan={8}><Text c="dimmed">No maintenance logged yet</Text></Table.Td></Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <SpendChart logs={logs ?? []} getPartsCost={partsCostForLog} />

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setEditingLog(null);
          form.reset();
          resetParts();
        }}
        title={editingLog ? "Edit Maintenance Log" : "Log Maintenance"}
        size="lg"
      >
        <form onSubmit={submit}>
          <Stack gap="sm">
            <NativeSelect
              required
              label="Task"
              data={[
                { value: "", label: "Select a task" },
                ...taskOptions,
                ...["Oil Change", "Tire Rotation", "Chain Lube", "Brake Service"]
                  .filter((n) => !tasks?.some((t) => t.name === n))
                  .map((n) => ({ value: `new:${n}`, label: `+ New: ${n}` })),
              ]}
              {...form.getInputProps("task_id")}
            />
            <NumberInput required label="Mileage" min={0} {...form.getInputProps("mileage")} />
            <DatePickerInput
              withAsterisk
              clearable
              label="Performed On"
              placeholder="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD"
              {...form.getInputProps("performed_on")}
            />
            <NumberInput label="Additional Parts Cost ($)" min={0} decimalScale={2} {...form.getInputProps("cost")} />
            <NumberInput label="Labor Cost ($)" min={0} decimalScale={2} {...form.getInputProps("labor_cost")} />
            <Textarea label="Notes" autosize minRows={2} {...form.getInputProps("notes")} />
            {/* Inventory Used */}
            <Stack gap="xs" mt="xs">
              <Text fw={600}>Inventory Used</Text>
              <Text size="sm" c="dimmed">
                Add the inventory parts used in this maintenance, with an exact quantity for each.
                Their cost is calculated from the inventory (a part with no cost set counts as $0).
              </Text>

              {selectedParts.length > 0 && (
                <Stack gap={6} my="xs">
                  {selectedParts.map((p) => {
                    const part = partById.get(p.id);
                    return (
                      <Group key={p.id} gap="xs">
                        <Group gap="sm" grow>
                          <Text size="sm" lineClamp={1}>
                            {part ? `${part.brand} ${part.name}` : p.id}
                          </Text>
                        </Group>
                        <NumberInput
                          w={110}
                          label="Qty"
                          min={0}
                          value={p.quantity ?? undefined}
                          onChange={(v) => updateQty(p.id, v)}
                        />
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => removePart(p.id)}
                          aria-label={`Remove ${part ? part.name : "part"}`}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </Group>
                    );
                  })}
                </Stack>
              )}

              {selectedParts.length > 0 && (
                <Text size="sm" fw={600} mt={4}>
                  Parts Cost (from inventory): ${formPartsCost.toFixed(2)}
                </Text>
              )}

              <Select
                searchable
                clearable
                label="Select a part"
                placeholder={
                  parts?.length ? "Choose from inventory" : "No inventory parts yet"
                }
                data={partOptions}
                value={partToAdd}
                onChange={(v) => setPartToAdd(v)}
                nothingFoundMessage="No parts found"
              />
              <Group gap="xs">
                <NumberInput
                  w={100}
                  label="Qty"
                  min={0}
                  value={partQty}
                  onChange={(v) => setPartQty(v === undefined ? 1 : Number(v))}
                />
                <Button
                  type="button"
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={addPart}
                  disabled={!partToAdd}
                  mt={22}
                >
                  Add
                </Button>
              </Group>
            </Stack>

            <Button type="submit" loading={createLog.isPending || updateLog.isPending}>{editingLog ? "Save Changes" : "Save"}</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}