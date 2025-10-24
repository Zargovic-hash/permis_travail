import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  FileText,
  MapPin,
  Clipboard,
  Users,
  BarChart3,
  ScrollText,
  Settings as SettingsIcon,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ isOpen }) {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: Home,
      roles: []
    },
    {
      name: 'Permis',
      path: '/permis',
      icon: FileText,
      roles: [],
      badge: null
    },
    {
      name: 'Zones',
      path: '/zones',
      icon: MapPin,
      roles: ['HSE', 'ADMIN']
    },
    {
      name: 'Types de Permis',
      path: '/types-permis',
      icon: Clipboard,
      roles: ['HSE', 'ADMIN']
    },
    {
      name: 'Utilisateurs',
      path: '/utilisateurs',
      icon: Users,
      roles: ['HSE', 'ADMIN']
    },
    {
      name: 'Rapports',
      path: '/rapports',
      icon: BarChart3,
      roles: ['HSE', 'ADMIN', 'SUPERVISEUR']
    },
    {
      name: 'Audit Logs',
      path: '/audit-logs',
      icon: ScrollText,
      roles: ['HSE', 'ADMIN']
    },
    {
      name: 'Administration',
      path: '/admin',
      icon: SettingsIcon,
      roles: ['ADMIN']
    }
  ];

  const canAccess = (roles) => {
    if (roles.length === 0) return true;
    return hasRole(...roles);
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => {}}
        />
      )}

      <aside
        className={`fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-64 bg-white border-r border-slate-200 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <nav className="h-full overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {menuItems
              .filter(item => canAccess(item.roles))
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                        active
                          ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className="leading-tight">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-700">
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <ChevronRight className="w-4 h-4 text-indigo-600" />
                      )}
                    </NavLink>
                  </li>
                );
              })}
          </ul>

          <div className="lg:hidden mt-6 pt-6 border-t border-slate-200 px-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-md font-semibold text-sm shadow-sm">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate leading-tight">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-slate-500 truncate leading-tight">{user?.email}</p>
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
