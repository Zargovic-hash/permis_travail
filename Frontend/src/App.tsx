import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Permis from "./pages/Permis";
import PermisCreate from "./pages/PermisCreate";
import Zones from "./pages/Zones";
import TypesPermis from "./pages/TypesPermis";
import Utilisateurs from "./pages/Utilisateurs";
import Rapport from "./pages/rapport";
import AuditLogs from "./pages/AuditLogs";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/permis" element={<Permis />} />
                  <Route path="/permis/create" element={<PermisCreate />} />
                  <Route path="/zones" element={<Zones />} />
                  <Route path="/types-permis" element={<TypesPermis />} />
                </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['HSE', 'ADMIN']} />}>
              <Route path="/utilisateurs" element={<Utilisateurs />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN']} />}>
              <Route path="/rapports" element={<Rapport />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
