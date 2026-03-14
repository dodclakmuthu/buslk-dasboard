import { Bus, User, Trip, Expense, CrewAssignment, DailySettlement, Notification } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Kamal Perera', phone: '0771234567', role: 'owner', companyId: 'comp-1', joinedDate: '2024-01-15', isActive: true, nic: '881234567V' },
  { id: 'user-2', name: 'Nimal Silva', phone: '0779876543', role: 'manager', companyId: 'comp-1', joinedDate: '2024-02-01', isActive: true, nic: '901234567V' },
  { id: 'user-3', name: 'Sunil Fernando', phone: '0712345678', role: 'driver', companyId: 'comp-1', joinedDate: '2024-03-10', isActive: true, licenseNo: 'B1234567', nic: '851234567V' },
  { id: 'user-4', name: 'Ruwan Jayawardena', phone: '0723456789', role: 'driver', companyId: 'comp-1', joinedDate: '2024-03-15', isActive: true, licenseNo: 'B2345678', nic: '871234567V' },
  { id: 'user-5', name: 'Chaminda Bandara', phone: '0756789012', role: 'conductor', companyId: 'comp-1', joinedDate: '2024-04-01', isActive: true, nic: '921234567V' },
  { id: 'user-6', name: 'Pradeep Kumara', phone: '0767890123', role: 'conductor', companyId: 'comp-1', joinedDate: '2024-04-05', isActive: true, nic: '891234567V' },
  { id: 'user-7', name: 'Asanka Wijesinghe', phone: '0778901234', role: 'driver', companyId: 'comp-1', joinedDate: '2024-05-01', isActive: true, licenseNo: 'B3456789', nic: '881234568V' },
  { id: 'user-8', name: 'Lakmal Rathnayake', phone: '0789012345', role: 'conductor', companyId: 'comp-1', joinedDate: '2024-05-10', isActive: true, nic: '931234567V' },
  { id: 'user-9', name: 'Dinesh Wickramasinghe', phone: '0790123456', role: 'driver', companyId: 'comp-1', joinedDate: '2024-06-01', isActive: false, licenseNo: 'B4567890', nic: '861234567V' },
  { id: 'user-10', name: 'Sampath Gunawardena', phone: '0701234567', role: 'conductor', companyId: 'comp-1', joinedDate: '2024-06-15', isActive: true, nic: '941234567V' },
];

export const MOCK_BUSES: Bus[] = [
  {
    id: 'bus-1', regNumber: 'NB-1234', ntcPermitNo: 'NTC/WP/138/001', routeId: 'route-1',
    serviceType: 'semi-luxury', seatCount: 54, companyId: 'comp-1', ownerId: 'user-1',
    status: 'active', wageModel: 'percentage', driverPercentage: 12, conductorPercentage: 8,
    permitExpiry: '2026-06-30', insuranceExpiry: '2026-12-31', fitnessExpiry: '2026-09-15',
    createdAt: '2024-01-20',
  },
  {
    id: 'bus-2', regNumber: 'NC-5678', ntcPermitNo: 'NTC/WP/002/015', routeId: 'route-2',
    serviceType: 'normal', seatCount: 50, companyId: 'comp-1', ownerId: 'user-1',
    status: 'active', wageModel: 'fixed', fixedDriverWage: 4500, fixedConductorWage: 3500,
    permitExpiry: '2026-08-15', insuranceExpiry: '2027-01-31', fitnessExpiry: '2026-11-30',
    createdAt: '2024-02-15',
  },
  {
    id: 'bus-3', regNumber: 'WP-9012', ntcPermitNo: 'NTC/WP/004/008', routeId: 'route-3',
    serviceType: 'luxury', seatCount: 42, companyId: 'comp-1', ownerId: 'user-1',
    status: 'active', wageModel: 'percentage', driverPercentage: 10, conductorPercentage: 7,
    permitExpiry: '2026-04-20', insuranceExpiry: '2026-10-15', fitnessExpiry: '2026-07-20',
    createdAt: '2024-03-01',
  },
  {
    id: 'bus-4', regNumber: 'SP-3456', ntcPermitNo: 'NTC/SP/006/022', routeId: 'route-4',
    serviceType: 'express', seatCount: 48, companyId: 'comp-1', ownerId: 'user-1',
    status: 'active', wageModel: 'percentage', driverPercentage: 11, conductorPercentage: 8,
    permitExpiry: '2027-01-10', insuranceExpiry: '2027-03-20', fitnessExpiry: '2026-12-01',
    createdAt: '2024-04-10',
  },
  {
    id: 'bus-5', regNumber: 'NW-7890', ntcPermitNo: 'NTC/NW/015/005', routeId: 'route-5',
    serviceType: 'normal', seatCount: 52, companyId: 'comp-1', ownerId: 'user-1',
    status: 'maintenance', wageModel: 'fixed', fixedDriverWage: 4000, fixedConductorWage: 3000,
    permitExpiry: '2026-05-25', insuranceExpiry: '2026-11-10', fitnessExpiry: '2026-08-30',
    createdAt: '2024-05-20',
  },
  {
    id: 'bus-6', regNumber: 'CP-2345', ntcPermitNo: 'NTC/CP/048/011', routeId: 'route-6',
    serviceType: 'semi-luxury', seatCount: 46, companyId: 'comp-1', ownerId: 'user-1',
    status: 'active', wageModel: 'percentage', driverPercentage: 12, conductorPercentage: 8,
    permitExpiry: '2026-09-30', insuranceExpiry: '2027-02-28', fitnessExpiry: '2026-10-15',
    createdAt: '2024-06-01',
  },
];

const today = '2026-03-10';

export const MOCK_ASSIGNMENTS: CrewAssignment[] = [
  { id: 'assign-1', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', date: today, isActive: true },
  { id: 'assign-2', busId: 'bus-2', driverId: 'user-4', conductorId: 'user-6', date: today, isActive: true },
  { id: 'assign-3', busId: 'bus-3', driverId: 'user-7', conductorId: 'user-8', date: today, isActive: true },
  { id: 'assign-4', busId: 'bus-4', driverId: 'user-3', conductorId: 'user-10', date: '2026-03-09', isActive: false },
];

export const MOCK_TRIPS: Trip[] = [
  // Today's trips for bus-1
  { id: 'trip-1', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', routeId: 'route-1', date: today, tripNumber: 1, startPointId: 'r1-p1', endPointId: 'r1-p11', startTime: '05:30', endTime: '09:15', status: 'completed', income: 42500, passengerCount: 48 },
  { id: 'trip-2', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', routeId: 'route-1', date: today, tripNumber: 2, startPointId: 'r1-p11', endPointId: 'r1-p1', startTime: '10:00', endTime: '13:45', status: 'completed', income: 38200, passengerCount: 42 },
  { id: 'trip-3', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', routeId: 'route-1', date: today, tripNumber: 3, startPointId: 'r1-p1', endPointId: 'r1-p7', startTime: '14:30', status: 'in-progress', income: 0 },
  // Today's trips for bus-2
  { id: 'trip-4', busId: 'bus-2', driverId: 'user-4', conductorId: 'user-6', routeId: 'route-2', date: today, tripNumber: 1, startPointId: 'r2-p1', endPointId: 'r2-p11', startTime: '06:00', endTime: '10:30', status: 'completed', income: 35800, passengerCount: 50 },
  { id: 'trip-5', busId: 'bus-2', driverId: 'user-4', conductorId: 'user-6', routeId: 'route-2', date: today, tripNumber: 2, startPointId: 'r2-p11', endPointId: 'r2-p1', startTime: '11:15', endTime: '15:30', status: 'completed', income: 31200, passengerCount: 45 },
  // Today's trips for bus-3
  { id: 'trip-6', busId: 'bus-3', driverId: 'user-7', conductorId: 'user-8', routeId: 'route-3', date: today, tripNumber: 1, startPointId: 'r3-p1', endPointId: 'r3-p9', startTime: '05:45', endTime: '08:30', status: 'completed', income: 28500, passengerCount: 38 },
  { id: 'trip-7', busId: 'bus-3', driverId: 'user-7', conductorId: 'user-8', routeId: 'route-3', date: today, tripNumber: 2, startPointId: 'r3-p9', endPointId: 'r3-p1', startTime: '09:15', endTime: '12:00', status: 'completed', income: 26800, passengerCount: 35 },
  // Yesterday's trips
  { id: 'trip-8', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', routeId: 'route-1', date: '2026-03-09', tripNumber: 1, startPointId: 'r1-p1', endPointId: 'r1-p11', startTime: '05:30', endTime: '09:00', status: 'completed', income: 44100, passengerCount: 52 },
  { id: 'trip-9', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', routeId: 'route-1', date: '2026-03-09', tripNumber: 2, startPointId: 'r1-p11', endPointId: 'r1-p1', startTime: '09:45', endTime: '13:30', status: 'completed', income: 39800, passengerCount: 46 },
  { id: 'trip-10', busId: 'bus-1', driverId: 'user-3', conductorId: 'user-5', routeId: 'route-1', date: '2026-03-09', tripNumber: 3, startPointId: 'r1-p1', endPointId: 'r1-p11', startTime: '14:15', endTime: '18:00', status: 'completed', income: 41300, passengerCount: 50 },
];

export const MOCK_EXPENSES: Expense[] = [
  // Today's expenses for bus-1
  { id: 'exp-1', tripId: 'trip-1', busId: 'bus-1', date: today, category: 'diesel', amount: 12500, description: 'Full tank at Kadawatha', enteredBy: 'user-5', timestamp: '2026-03-10T05:15:00' },
  { id: 'exp-2', tripId: 'trip-1', busId: 'bus-1', date: today, category: 'meals', amount: 800, description: 'Breakfast for crew', enteredBy: 'user-5', timestamp: '2026-03-10T07:30:00' },
  { id: 'exp-3', tripId: 'trip-2', busId: 'bus-1', date: today, category: 'runner', amount: 500, description: 'Runner at Kandy stand', enteredBy: 'user-5', timestamp: '2026-03-10T09:50:00' },
  { id: 'exp-4', busId: 'bus-1', date: today, category: 'parking', amount: 300, description: 'Overnight parking', enteredBy: 'user-5', timestamp: '2026-03-10T05:00:00' },
  // Today's expenses for bus-2
  { id: 'exp-5', tripId: 'trip-4', busId: 'bus-2', date: today, category: 'diesel', amount: 14200, description: 'Full tank at Moratuwa', enteredBy: 'user-6', timestamp: '2026-03-10T05:45:00' },
  { id: 'exp-6', tripId: 'trip-4', busId: 'bus-2', date: today, category: 'expressway', amount: 1800, description: 'Southern Expressway toll', enteredBy: 'user-6', timestamp: '2026-03-10T06:30:00' },
  { id: 'exp-7', busId: 'bus-2', date: today, category: 'meals', amount: 1200, description: 'Lunch for crew', enteredBy: 'user-6', timestamp: '2026-03-10T12:30:00' },
  // Today's expenses for bus-3
  { id: 'exp-8', tripId: 'trip-6', busId: 'bus-3', date: today, category: 'diesel', amount: 9800, description: 'Diesel at Nugegoda', enteredBy: 'user-8', timestamp: '2026-03-10T05:30:00' },
  { id: 'exp-9', busId: 'bus-3', date: today, category: 'repairs', amount: 2500, description: 'Fan belt replacement', enteredBy: 'user-8', timestamp: '2026-03-10T08:45:00' },
  // Yesterday's expenses
  { id: 'exp-10', busId: 'bus-1', date: '2026-03-09', category: 'diesel', amount: 15000, description: 'Full tank', enteredBy: 'user-5', timestamp: '2026-03-09T05:00:00' },
  { id: 'exp-11', busId: 'bus-1', date: '2026-03-09', category: 'meals', amount: 1500, description: 'Meals for crew', enteredBy: 'user-5', timestamp: '2026-03-09T12:00:00' },
  { id: 'exp-12', busId: 'bus-1', date: '2026-03-09', category: 'runner', amount: 1000, description: 'Runner charges', enteredBy: 'user-5', timestamp: '2026-03-09T09:30:00' },
];

export const MOCK_SETTLEMENTS: DailySettlement[] = [
  {
    id: 'settle-1', busId: 'bus-1', date: '2026-03-09',
    totalIncome: 125200, totalExpenses: 17500, dti: 107700,
    driverSalary: 12924, conductorSalary: 8616, netProfit: 86160,
    wageModel: 'percentage', driverPercentage: 12, conductorPercentage: 8,
    isLocked: true, settledBy: 'user-1', settledAt: '2026-03-09T20:30:00',
    trips: ['trip-8', 'trip-9', 'trip-10'], expenses: ['exp-10', 'exp-11', 'exp-12'],
  },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-1', title: 'Permit Expiry Alert', message: 'Bus WP-9012 permit expires on 2026-04-20. Renew within 40 days.', type: 'warning', isRead: false, createdAt: '2026-03-10T08:00:00' },
  { id: 'notif-2', userId: 'user-1', title: 'Trip Completed', message: 'Bus NB-1234 completed Trip #2 on Route 138. Income: Rs. 38,200', type: 'success', isRead: false, createdAt: '2026-03-10T13:45:00' },
  { id: 'notif-3', userId: 'user-1', title: 'Bus in Maintenance', message: 'Bus NW-7890 is currently in maintenance. No trips scheduled.', type: 'info', isRead: true, createdAt: '2026-03-09T16:00:00' },
  { id: 'notif-4', userId: 'user-1', title: 'Settlement Locked', message: 'Daily settlement for Bus NB-1234 on 2026-03-09 has been locked.', type: 'success', isRead: true, createdAt: '2026-03-09T20:30:00' },
  { id: 'notif-5', userId: 'user-1', title: 'Insurance Expiry', message: 'Bus NB-1234 insurance expires on 2026-12-31. Plan renewal.', type: 'info', isRead: true, createdAt: '2026-03-08T08:00:00' },
];

export const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-LK')}`;
};

export const getTodayString = (): string => '2026-03-10';
