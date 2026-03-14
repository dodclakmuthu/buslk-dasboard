
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CreateCompany from "./pages/CreateCompany";
import ProtectedRoute from "./components/ProtectedRoute";
import CompanyRoute from "./components/CompanyRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { CompanyProvider } from "./contexts/CompanyContext";
import Dashboard from "./components/Dashboard";
import BusManagement from "./components/BusManagement";
import TripManagement from "./components/TripManagement";
import StaffManagement from "./components/StaffManagement";
import DailySettlement from "./components/DailySettlement";
import Reports from "./components/Reports";
import RouteMaster from "./components/RouteMaster";
import NotificationsView from "./components/NotificationsView";
import Blueprint from "./components/Blueprint";
import SettingsView from "./components/SettingsView";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <CompanyProvider>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route element={<ProtectedRoute />}>
                  {/* Accessible when authenticated, even without a company */}
                  <Route path="/company/new" element={<CreateCompany />} />

                  {/* All business routes require an active company */}
                  <Route element={<CompanyRoute />}>
                    <Route element={<Index />}>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="buses" element={<BusManagement />} />
                      <Route path="trips" element={<TripManagement />} />
                      <Route path="staff" element={<StaffManagement />} />
                      <Route path="settlement" element={<DailySettlement />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="routes" element={<RouteMaster />} />
                      <Route path="notifications" element={<NotificationsView />} />
                      <Route path="blueprint" element={<Blueprint />} />
                      <Route path="settings" element={<SettingsView />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CompanyProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
