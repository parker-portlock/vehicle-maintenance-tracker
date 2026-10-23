import { useState } from "react";
import {
  Alert, Button, Card, Divider, FileInput, Group, Stack, Text, Title,
} from "@mantine/core";
import { downloadBackup, restoreBackup } from "../api/client";

export default function Settings() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const handleBackup = async () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    clearFeedback();
    try {
      const filename = await downloadBackup();
      setSuccess(`Backup downloaded as ${filename}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Backup failed. Please try again.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!backupFile || isRestoring) return;
    const confirmed = confirm(
      `Restore from "${backupFile.name}"?\n\n` +
        "This permanently replaces ALL current data (vehicles, tasks, " +
        "logs, parts and attachments) with the contents of the backup file."
    );
    if (!confirmed) return;
    setIsRestoring(true);
    clearFeedback();
    try {
      const result = await restoreBackup(backupFile);
      const summary = Object.entries(result.tables)
        .map(([table, count]) => `${count} ${table}`)
        .join(", ");
      setSuccess(`Database restored: ${summary}.`);
      setBackupFile(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Restore failed. The current database was not modified."
      );
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Stack gap="lg">
      <div>
        <Title order={2}>⚙️ Settings</Title>
        <Text c="dimmed" mt={4}>
          Manage your application preferences.
        </Text>
      </div>

      <Card withBorder padding="lg">
        <Stack gap="md">
          <Title order={4}>Data</Title>

          <Group justify="space-between" wrap="wrap" align="flex-start">
            <div>
              <Text fw={600}>Backup</Text>
              <Text size="sm" c="dimmed">
                Download the entire database (vehicles, tasks, logs, parts and
                attachments) as a single JSON file.
              </Text>
            </div>
            <Button loading={isBackingUp} onClick={handleBackup}>
              Download Backup
            </Button>
          </Group>

          <Divider my="xs" />

          <div>
            <Text fw={600}>Restore</Text>
            <Text size="sm" c="dimmed" mb="sm">
              Upload a backup file to permanently replace all current data.
            </Text>
            <Group justify="space-between" wrap="wrap" align="flex-end" gap="md">
              <FileInput
                label="Backup file"
                accept="application/json,.json"
                placeholder="Select a .json backup file"
                value={backupFile}
                onChange={(file) => {
                  setBackupFile(file);
                  clearFeedback();
                }}
                style={{ flex: 1, minWidth: 240 }}
              />
              <Button
                color="red"
                loading={isRestoring}
                disabled={!backupFile}
                onClick={handleRestore}
              >
                Restore Database
              </Button>
            </Group>
          </div>

          {error && (
            <Alert variant="light" color="red" title="Error">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="light" color="green" title="Success">
              {success}
            </Alert>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

