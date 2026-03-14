import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bus, User, Trip, Expense, CrewAssignment, DailySettlement, Notification } from '@/data/types';
import { MOCK_BUSES, MOCK_USERS, MOCK_TRIPS, MOCK_EXPENSES, MOCK_ASSIGNMENTS, MOCK_SETTLEMENTS, MOCK_NOTIFICATIONS, getTodayString } from '@/data/mockData';
import { toast } from '@/components/ui/use-toast';


type PageView = 'dashboard' | 'buses' | 'trips' | 'staff' | 'settlement' | 'reports' | 'routes' | 'notifications' | 'settings' | 'blueprint';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentView: PageView;
  setCurrentView: (view: PageView) => void;
  currentUser: User;
  buses: Bus[];
  users: User[];
  trips: Trip[];
  expenses: Expense[];
  assignments: CrewAssignment[];
  settlements: DailySettlement[];
  notifications: Notification[];
  addBus: (bus: Omit<Bus, 'id' | 'createdAt'>) => void;
  updateBus: (id: string, updates: Partial<Bus>) => void;
  addUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'timestamp'>) => void;
  addAssignment: (assignment: Omit<CrewAssignment, 'id'>) => void;
  calculateSettlement: (busId: string, date: string) => DailySettlement | null;
  lockSettlement: (settlement: DailySettlement) => void;
  markNotificationRead: (id: string) => void;
  getBusById: (id: string) => Bus | undefined;
  getUserById: (id: string) => User | undefined;
  getDrivers: () => User[];
  getConductors: () => User[];
  getTripsByBusAndDate: (busId: string, date: string) => Trip[];
  getExpensesByBusAndDate: (busId: string, date: string) => Expense[];
  getAssignmentForBus: (busId: string, date: string) => CrewAssignment | undefined;
  unreadNotificationCount: number;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<PageView>('dashboard');
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [assignments, setAssignments] = useState<CrewAssignment[]>(MOCK_ASSIGNMENTS);
  const [settlements, setSettlements] = useState<DailySettlement[]>(MOCK_SETTLEMENTS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const currentUser = users[0]; // Owner

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const addBus = useCallback((bus: Omit<Bus, 'id' | 'createdAt'>) => {
    const newBus: Bus = { ...bus, id: generateId('bus'), createdAt: getTodayString() };
    setBuses(prev => [...prev, newBus]);
    toast({ title: 'Bus Added', description: `${newBus.regNumber} has been registered successfully.` });
  }, []);

  const updateBus = useCallback((id: string, updates: Partial<Bus>) => {
    setBuses(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    toast({ title: 'Bus Updated', description: 'Bus details have been updated.' });
  }, []);

  const addUser = useCallback((user: Omit<User, 'id' | 'joinedDate'>) => {
    const newUser: User = { ...user, id: generateId('user'), joinedDate: getTodayString() };
    setUsers(prev => [...prev, newUser]);
    toast({ title: 'Staff Added', description: `${newUser.name} has been added as ${newUser.role}.` });
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const addTrip = useCallback((trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = { ...trip, id: generateId('trip') };
    setTrips(prev => [...prev, newTrip]);
    toast({ title: 'Trip Started', description: `Trip #${newTrip.tripNumber} has been started.` });
  }, []);

  const updateTrip = useCallback((id: string, updates: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (updates.status === 'completed') {
      toast({ title: 'Trip Completed', description: `Trip income recorded: Rs. ${updates.income?.toLocaleString()}` });
    }
  }, []);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'timestamp'>) => {
    const newExpense: Expense = { ...expense, id: generateId('exp'), timestamp: new Date().toISOString() };
    setExpenses(prev => [...prev, newExpense]);
    toast({ title: 'Expense Added', description: `Rs. ${expense.amount.toLocaleString()} recorded.` });
  }, []);

  const addAssignment = useCallback((assignment: Omit<CrewAssignment, 'id'>) => {
    setAssignments(prev => {
      const updated = prev.map(a =>
        a.busId === assignment.busId && a.date === assignment.date ? { ...a, isActive: false } : a
      );
      return [...updated, { ...assignment, id: generateId('assign') }];
    });
    toast({ title: 'Crew Assigned', description: 'Driver and conductor have been assigned.' });
  }, []);

  const getBusById = (id: string) => buses.find(b => b.id === id);
  const getUserById = (id: string) => users.find(u => u.id === id);
  const getDrivers = () => users.filter(u => u.role === 'driver' && u.isActive);
  const getConductors = () => users.filter(u => u.role === 'conductor' && u.isActive);

  const getTripsByBusAndDate = (busId: string, date: string) =>
    trips.filter(t => t.busId === busId && t.date === date);

  const getExpensesByBusAndDate = (busId: string, date: string) =>
    expenses.filter(e => e.busId === busId && e.date === date);

  const getAssignmentForBus = (busId: string, date: string) =>
    assignments.find(a => a.busId === busId && a.date === date && a.isActive);

  const calculateSettlement = useCallback((busId: string, date: string): DailySettlement | null => {
    const bus = buses.find(b => b.id === busId);
    if (!bus) return null;

    const dayTrips = trips.filter(t => t.busId === busId && t.date === date && t.status === 'completed');
    const dayExpenses = expenses.filter(e => e.busId === busId && e.date === date);

    const totalIncome = dayTrips.reduce((sum, t) => sum + t.income, 0);
    const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dti = totalIncome - totalExpenses;

    let driverSalary = 0;
    let conductorSalary = 0;

    if (bus.wageModel === 'percentage') {
      driverSalary = Math.round(dti * (bus.driverPercentage || 0) / 100);
      conductorSalary = Math.round(dti * (bus.conductorPercentage || 0) / 100);
    } else {
      driverSalary = bus.fixedDriverWage || 0;
      conductorSalary = bus.fixedConductorWage || 0;
    }

    // Prevent negative salaries
    if (dti < 0) {
      driverSalary = bus.wageModel === 'fixed' ? (bus.fixedDriverWage || 0) : 0;
      conductorSalary = bus.wageModel === 'fixed' ? (bus.fixedConductorWage || 0) : 0;
    }

    const netProfit = dti - driverSalary - conductorSalary;

    return {
      id: generateId('settle'),
      busId,
      date,
      totalIncome,
      totalExpenses,
      dti,
      driverSalary,
      conductorSalary,
      netProfit,
      wageModel: bus.wageModel,
      driverPercentage: bus.driverPercentage,
      conductorPercentage: bus.conductorPercentage,
      isLocked: false,
      settledBy: currentUser.id,
      settledAt: new Date().toISOString(),
      trips: dayTrips.map(t => t.id),
      expenses: dayExpenses.map(e => e.id),
    };
  }, [buses, trips, expenses, currentUser]);

  const lockSettlement = useCallback((settlement: DailySettlement) => {
    setSettlements(prev => {
      const existing = prev.findIndex(s => s.busId === settlement.busId && s.date === settlement.date);
      const locked = { ...settlement, isLocked: true, settledAt: new Date().toISOString() };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = locked;
        return updated;
      }
      return [...prev, locked];
    });
    toast({ title: 'Settlement Locked', description: 'Daily settlement has been finalized and locked.' });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        sidebarOpen, toggleSidebar, currentView, setCurrentView,
        currentUser, buses, users, trips, expenses, assignments, settlements, notifications,
        addBus, updateBus, addUser, updateUser, addTrip, updateTrip,
        addExpense, addAssignment, calculateSettlement, lockSettlement,
        markNotificationRead, getBusById, getUserById, getDrivers, getConductors,
        getTripsByBusAndDate, getExpensesByBusAndDate, getAssignmentForBus,
        unreadNotificationCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
