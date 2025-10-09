import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MapPin, 
  Settings, 
  Users, 
  BarChart3, 
  Shield,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/utils/constants';

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/',
    icon: LayoutDashboard,
    roles: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN']
  },
  {
    name: 'Permis de travail',
    href: '/permis',
    icon: FileText,
    roles: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN']
  },
  {
    name: 'Zones',
    href: '/zones',
    icon: MapPin,
    roles: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN']
  },
  {
    name: 'Types de permis',
    href: '/types-permis',
    icon: ClipboardList,
    roles: ['DEMANDEUR', 'SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN']
  },
  {
    name: 'Utilisateurs',
    href: '/utilisateurs',
    icon: Users,
    roles: ['HSE', 'ADMIN']
  },
  {
    name: 'Rapports',
    href: '/rapports',
    icon: BarChart3,
    roles: ['SUPERVISEUR', 'RESP_ZONE', 'HSE', 'ADMIN']
  },
  {
    name: 'Logs d\'audit',
    href: '/audit-logs',
    icon: Shield,
    roles: ['HSE', 'ADMIN']
  },
  {
    name: 'Administration',
    href: '/admin',
    icon: UserCheck,
    roles: ['ADMIN']
  }
];

export const Sidebar = () => {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="hidden border-r bg-muted/40 md:block w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <span className="font-semibold">Navigation</span>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                    isActive && 'bg-muted text-primary'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};