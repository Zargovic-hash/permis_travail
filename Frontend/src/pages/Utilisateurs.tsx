import { useState } from 'react';
import { Plus, Search, Users, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { DataTable } from '@/components/common/DataTable';
import { Role } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/utils/constants';

// Mock data for demonstration
const mockUsers = [
  {
    id: '1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@exemple.com',
    role: Role.DEMANDEUR,
    actif: true,
    date_creation: '2024-01-15'
  },
  {
    id: '2',
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@exemple.com',
    role: Role.SUPERVISEUR,
    actif: true,
    date_creation: '2024-01-10'
  },
  {
    id: '3',
    nom: 'Durand',
    prenom: 'Pierre',
    email: 'pierre.durand@exemple.com',
    role: Role.RESP_ZONE,
    actif: false,
    date_creation: '2024-01-05'
  },
  {
    id: '4',
    nom: 'Leroy',
    prenom: 'Sophie',
    email: 'sophie.leroy@exemple.com',
    role: Role.HSE,
    actif: true,
    date_creation: '2024-01-01'
  }
];

export default function Utilisateurs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      sortable: true,
      render: (value: string, row: any) => `${row.prenom} ${value}`
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (value: Role) => (
        <Badge className={ROLE_COLORS[value]}>
          {ROLE_LABELS[value]}
        </Badge>
      )
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    {
      key: 'date_creation',
      label: 'Date de création',
      sortable: true
    }
  ];

  const filteredData = mockUsers.filter(user => {
    const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeUsers = mockUsers.filter(user => user.actif).length;
  const inactiveUsers = mockUsers.filter(user => !user.actif).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Utilisateurs</h1>
            <p className="text-muted-foreground">Gérez les utilisateurs du système</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.length}</div>
              <p className="text-xs text-muted-foreground">Utilisateurs enregistrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">Comptes actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs inactifs</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inactiveUsers}</div>
              <p className="text-xs text-muted-foreground">Comptes inactifs</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des utilisateurs</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredData}
              columns={columns}
              searchable={false}
              pagination={true}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}