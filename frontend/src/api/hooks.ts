import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { MaintenanceLog, MaintenanceTask, Vehicle, Part } from "./types";

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => apiFetch<Vehicle[]>("/api/v1/vehicles"),
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => apiFetch<Vehicle>(`/api/v1/vehicles/${id}`),
    enabled: !!id,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiFetch<MaintenanceTask[]>("/api/v1/tasks"),
  });
}

export function useVehicleLogs(vehicleId: string) {
  return useQuery({
    queryKey: ["vehicles", vehicleId, "logs"],
    queryFn: () => apiFetch<MaintenanceLog[]>(`/api/v1/vehicles/${vehicleId}/logs`),
    enabled: !!vehicleId,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Vehicle, "id" | "created_at" | "updated_at">) =>
      apiFetch<Vehicle>("/api/v1/vehicles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
    onError: (error) => {
      // Handle potential duplicate VIN error
      console.error("Vehicle creation error:", error);
    }
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/v1/vehicles/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useCreateLog(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      task_id?: string;
      task_name?: string;
      mileage: number;
      performed_on: string;
      cost?: number;
      notes?: string;
      parts_used?: unknown[];
    }) =>
      apiFetch<MaintenanceLog>(`/api/v1/vehicles/${vehicleId}/logs`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["vehicles", vehicleId, "logs"] }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string | null; interval_miles?: number | null; interval_months?: number | null }) => {
      // Convert empty strings to null for optional numeric fields to avoid validation errors
      const processedData = {
        ...data,
        interval_miles: typeof data.interval_miles === "string" && data.interval_miles === "" ? null : data.interval_miles,
        interval_months: typeof data.interval_months === "string" && data.interval_months === "" ? null : data.interval_months,
      };
      return apiFetch<MaintenanceTask>("/api/v1/tasks", {
        method: "POST",
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/v1/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useParts() {
  return useQuery({
    queryKey: ["parts"],
    queryFn: () => apiFetch<Part[]>("/api/v1/parts"),
  });
}

export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Part, "id">) =>
      apiFetch<Part>("/api/v1/parts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}

export function useUpdatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Part) =>
      apiFetch<Part>(`/api/v1/parts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}

export function useDeletePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/v1/parts/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["parts"] }),
  });
}