export type UserRole = 'owner' | 'manager' | 'driver' | 'conductor';
export type WageModel = 'percentage' | 'fixed';
export type ServiceType = 'normal' | 'semi-luxury' | 'luxury' | 'express' | 'super-luxury';
export type TripStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
export type BusStatus = 'active' | 'inactive' | 'maintenance';
export type ExpenseCategory = 'diesel' | 'expressway' | 'runner' | 'parking' | 'meals' | 'repairs' | 'other';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  companyId?: string;
  avatar?: string;
  nic?: string;
  licenseNo?: string;
  joinedDate: string;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  phone?: string;
  registrationNo?: string;
  createdAt: string;
}

export interface RoutePoint {
  id: string;
  name: string;
  nameSi?: string;
  nameTa?: string;
  order: number;
  isMainStop: boolean;
  distanceFromStart?: number;
}

export interface BusRoute {
  id: string;
  routeNo: string;
  name: string;
  origin: string;
  destination: string;
  points: RoutePoint[];
  distanceKm?: number;
  isActive: boolean;
}

export interface Bus {
  id: string;
  regNumber: string;
  ntcPermitNo?: string;
  routeId: string;
  serviceType: ServiceType;
  seatCount: number;
  companyId?: string;
  ownerId: string;
  status: BusStatus;
  wageModel: WageModel;
  driverPercentage?: number;
  conductorPercentage?: number;
  fixedDriverWage?: number;
  fixedConductorWage?: number;
  permitExpiry?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  createdAt: string;
}

export interface CrewAssignment {
  id: string;
  busId: string;
  driverId: string;
  conductorId: string;
  date: string;
  isActive: boolean;
}

export interface Trip {
  id: string;
  busId: string;
  driverId: string;
  conductorId: string;
  routeId: string;
  date: string;
  tripNumber: number;
  startPointId: string;
  endPointId?: string;
  startTime: string;
  endTime?: string;
  status: TripStatus;
  income: number;
  passengerCount?: number;
  notes?: string;
}

export interface Expense {
  id: string;
  tripId?: string;
  busId: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  receiptPhoto?: string;
  enteredBy: string;
  timestamp: string;
}

export type ExtraIncomeCategory = 'PARCEL' | 'BAGGAGE' | 'OTHER_EXTRA_INCOME';

export interface ExtraIncome {
  id: string;
  tripId?: string;
  busId: string;
  date: string;
  category: ExtraIncomeCategory;
  amount: number;
  note?: string;
  enteredBy: string;
  timestamp: string;
}

export interface DailySettlement {
  id: string;
  busId: string;
  date: string;
  totalIncome: number;
  totalExpenses: number;
  dti: number;
  driverSalary: number;
  conductorSalary: number;
  netProfit: number;
  wageModel: WageModel;
  driverPercentage?: number;
  conductorPercentage?: number;
  isLocked: boolean;
  settledBy: string;
  settledAt: string;
  trips: string[];
  expenses: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'diesel', label: 'Diesel / Fuel', icon: 'fuel' },
  { value: 'expressway', label: 'Expressway Charges', icon: 'road' },
  { value: 'runner', label: 'Runner Charges', icon: 'users' },
  { value: 'parking', label: 'Parking', icon: 'parking' },
  { value: 'meals', label: 'Meals / Allowances', icon: 'utensils' },
  { value: 'repairs', label: 'Minor Repairs', icon: 'wrench' },
  { value: 'other', label: 'Other Expenses', icon: 'receipt' },
];

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'normal', label: 'Normal Service' },
  { value: 'semi-luxury', label: 'Semi-Luxury' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'express', label: 'Express' },
  { value: 'super-luxury', label: 'Super Luxury' },
];
