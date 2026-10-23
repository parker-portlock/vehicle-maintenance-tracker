import { Text } from "@mantine/core";

export default function VersionWatermark() {
  return (
    <Text size="xs" fw={400} opacity={0.6}>
      {`v${import.meta.env.VITE_APP_VERSION}`}
    </Text>
  );
}
