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