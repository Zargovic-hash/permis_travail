import { LayoutDashboard, FileText, Users, MapPin, FolderKanban, LogOut, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Role } from '@/types';
import { useState } from 'react';

const navigation = [
  { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard, roles: [Role.HSE, Role.ADMIN, Role.RESP_ZONE, Role.SUPERVISEUR, Role.DEMANDEUR] },
  { name: 'Mes Permis', href: '/permis', icon: FileText, roles: [Role.HSE, Role.ADMIN, Role.RESP_ZONE, Role.SUPERVISEUR, Role.DEMANDEUR] },
  { name: 'Utilisateurs', href: '/admin/users', icon: Users, roles: [Role.HSE, Role.ADMIN] },
  { name: 'Zones', href: '/admin/zones', icon: MapPin, roles: [Role.HSE, Role.ADMIN] },
  { name: 'Types de Permis', href: '/admin/types', icon: FolderKanban, roles: [Role.HSE, Role.ADMIN] },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-sidebar-border bg-sidebar',
          isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'w-64',
          'lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-bold text-sm">HSE</span>
                </div>
                <span className="text-sidebar-foreground font-semibold">HSE Manager</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isCollapsed && 'mx-auto')} />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-sidebar-border p-4">
            {user && !isCollapsed && (
              <div className="mb-3 px-3">
                <p className="text-sm font-medium text-sidebar-foreground">{user.prenom} {user.nom}</p>
                <p className="text-xs text-sidebar-foreground/70">{user.role}</p>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isCollapsed && 'justify-center'
              )}
            >
              <LogOut className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
              {!isCollapsed && 'Déconnexion'}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
