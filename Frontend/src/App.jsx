import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

// Placeholder pages (à créer dans les prochaines parties)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PermisList = lazy(() => import('./pages/permis/PermisList'));
const PermisCreate = lazy(() => import('./pages/permis/PermisCreate'));
const PermisDetail = lazy(() => import('./pages/permis/PermisDetail'));
const PermisEdit = lazy(() => import('./pages/permis/PermisEdit'));
const ZonesList = lazy(() => import('./pages/zones/ZonesList'));
const TypesPermisList = lazy(() => import('./pages/types/TypesPermisList'));
const UtilisateursList = lazy(() => import('./pages/utilisateurs/UtilisateursList'));
const UtilisateurProfile = lazy(() => import('./pages/utilisateurs/UtilisateurProfile'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const AuditLogs = lazy(() => import('./pages/audit/AuditLogs'));
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PermisValidate = lazy(() => import('./pages/permis/PermisValidate'));


// Configuration React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: false,
    },
  },
});

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
      <p className="mt-4 text-gray-600">Chargement...</p>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />

                  {/* Permis Routes */}
                  <Route path="/permis" element={<PermisList />} />
                  <Route path="/permis/nouveau" element={<PermisCreate />} />
                  <Route path="/permis/:id" element={<PermisDetail />} />
                  <Route path="/permis/:id/modifier" element={<PermisEdit />} />
                  <Route path="/permis/:id/valider" element={<PermisValidate />} />


                  {/* Zones & Types Routes (HSE/ADMIN) */}
                  <Route element={<ProtectedRoute allowedRoles={['HSE', 'ADMIN']} />}>
                    <Route path="/zones" element={<ZonesList />} />
                    <Route path="/types-permis" element={<TypesPermisList />} />
                  </Route>

                  {/* Users Routes (HSE/ADMIN) */}
                  <Route element={<ProtectedRoute allowedRoles={['HSE', 'ADMIN']} />}>
                    <Route path="/utilisateurs" element={<UtilisateursList />} />
                    <Route path="/utilisateurs/:id" element={<UtilisateurProfile />} />
                  </Route>

                  {/* Reports Routes (HSE/ADMIN/SUPERVISEUR) */}
                  <Route element={<ProtectedRoute allowedRoles={['HSE', 'ADMIN', 'SUPERVISEUR']} />}>
                    <Route path="/rapports" element={<Reports />} />
                  </Route>

                  {/* Audit Logs (HSE/ADMIN) */}
                  <Route element={<ProtectedRoute allowedRoles={['HSE', 'ADMIN']} />}>
                    <Route path="/audit-logs" element={<AuditLogs />} />
                  </Route>

                  {/* Admin Panel (ADMIN only) */}
                  <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                    <Route path="/admin" element={<AdminPanel />} />
                  </Route>

                  {/* Profile & Settings */}
                  <Route path="/profil" element={<Profile />} />
                  <Route path="/parametres" element={<Settings />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </AuthProvider>
      </BrowserRouter>

      {/* React Query Devtools (only in development) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;