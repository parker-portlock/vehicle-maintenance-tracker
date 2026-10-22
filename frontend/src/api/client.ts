const BASE_URL = "http://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    // Try to parse the error message from the response
    let errorMessage = `API error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (e) {
      // If we can't parse JSON, keep the default message
    }
    
    // Check for specific duplicate VIN error
    if (errorMessage.includes("duplicate") && errorMessage.includes("vin")) {
      throw new Error("A vehicle with this VIN already exists. Please use a different VIN or check if you're adding a duplicate vehicle.");
    }
    
    throw new Error(errorMessage);
  }
  return res.json();
}

export async function downloadBackup(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/v1/backup/export`);
  if (!res.ok) {
    let errorMessage = `API error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (e) {
      // If we can't parse JSON, keep the default message
    }
    throw new Error(errorMessage);
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/.exec(disposition);
  const filename =
    match?.[1] ??
    `vehicle-maintenance-backup-${new Date().toISOString().slice(0, 10)}.json`;

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return filename;
}

export async function restoreBackup(
  file: File
): Promise<{ status: string; tables: Record<string, number> }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/v1/backup/restore`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    let errorMessage = `API error: ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (e) {
      // If we can't parse JSON, keep the default message
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

