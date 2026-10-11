export interface Vehicle {
  id: string;
  make: string;
  model: string;
  type: string;
  year: number;
  vin: string | null;
  purchase_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceTask {
  id: string;
  name: string;
  description: string | null;
  interval_miles: number | null;
  interval_months: number | null;
}

export interface LogPart {
  // id is the referenced inventory part's id
  id: string;
  brand: string;
  name: string;
  category: string;
  quantity: number | null;
}

// Payload shape accepted when writing a log's inventory parts
export interface LogPartRef {
  id: string;
  quantity: number | null;
}

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  task: MaintenanceTask;
  mileage: number;
  performed_on: string;
  cost: number | null;
  notes: string | null;
  parts_used: LogPart[] | null;
  created_at: string;
}

export interface Part {
  id: string;
  brand: string;
  name: string;
  category: string;
  part_number: string;
  specification: string | null;
  capacity: number | null;
  cost: number | null;
  quantity: number;
  supplier: string | null;
  notes: string | null;
}