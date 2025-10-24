import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Shield
} from 'lucide-react';

export default function Header({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'Nouveau permis en attente de validation', time: '5 min', unread: true },
    { id: 2, message: 'Permis PT-2025-00042 approuvé', time: '1h', unread: true },
    { id: 3, message: 'Permis PT-2025-00038 expire demain', time: '2h', unread: false },
  ]);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      DEMANDEUR: 'Demandeur',
      SUPERVISEUR: 'Superviseur',
      RESP_ZONE: 'Responsable de Zone',
      HSE: 'HSE',
      ADMIN: 'Administrateur'
    };
    return roles[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      DEMANDEUR: 'bg-slate-100 text-slate-700',
      SUPERVISEUR: 'bg-indigo-100 text-indigo-700',
      RESP_ZONE: 'bg-purple-100 text-purple-700',
      HSE: 'bg-emerald-100 text-emerald-700',
      ADMIN: 'bg-rose-100 text-rose-700'
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-lg p-1.5 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-slate-900 leading-tight">HSE System</h1>
              <p className="text-xs text-slate-500 leading-tight">Gestion des Permis</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notifMenuRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-semibold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-12 text-center">
                      <p className="text-sm text-slate-500">Aucune notification</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                            notif.unread ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            {notif.unread && (
                              <div className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-indigo-500 rounded-full" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-900 leading-relaxed">{notif.message}</p>
                              <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                  <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 pl-2.5 pr-1.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900 leading-tight">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-xs text-slate-500 leading-tight">{getRoleLabel(user?.role)}</p>
              </div>
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-md font-semibold text-sm shadow-sm">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{user?.email}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${getRoleBadgeColor(user?.role)}`}>
                    {getRoleLabel(user?.role)}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/profil');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Mon profil</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/parametres');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Paramètres</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
