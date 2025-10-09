import { useState } from 'react';
import { Search, Shield, Calendar, User, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { DataTable } from '@/components/common/DataTable';
import { ActionAudit } from '@/types';
import { ACTION_AUDIT_LABELS, ACTION_AUDIT_COLORS } from '@/utils/constants';

// Mock data for demonstration
const mockAuditLogs = [
  {
    id: 1,
    action: ActionAudit.CONNEXION,
    utilisateur_id: '1',
    cible_table: 'utilisateurs',
    cible_id: '1',
    payload: { email: 'jean.dupont@exemple.com' },
    ip_client: '192.168.1.100',
    date_action: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    action: ActionAudit.CREATION_PERMIS,
    utilisateur_id: '1',
    cible_table: 'permis',
    cible_id: 'PT-2024-00001',
    payload: { titre: 'Travaux électriques' },
    ip_client: '192.168.1.100',
    date_action: '2024-01-15T11:00:00Z'
  },
  {
    id: 3,
    action: ActionAudit.VALIDATION_PERMIS,
    utilisateur_id: '2',
    cible_table: 'permis',
    cible_id: 'PT-2024-00001',
    payload: { commentaire: 'Validation approuvée' },
    ip_client: '192.168.1.101',
    date_action: '2024-01-15T14:30:00Z'
  },
  {
    id: 4,
    action: ActionAudit.CONNEXION_ECHEC,
    utilisateur_id: null,
    cible_table: 'utilisateurs',
    cible_id: 'unknown',
    payload: { email: 'invalid@exemple.com' },
    ip_client: '192.168.1.102',
    date_action: '2024-01-15T16:00:00Z'
  }
];

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const columns = [
    {
      key: 'date_action',
      label: 'Date/Heure',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString('fr-FR')
    },
    {
      key: 'action',
      label: 'Action',
      render: (value: ActionAudit) => (
        <Badge className={ACTION_AUDIT_COLORS[value] || 'bg-gray-100 text-gray-800'}>
          {ACTION_AUDIT_LABELS[value]}
        </Badge>
      )
    },
    {
      key: 'utilisateur_id',
      label: 'Utilisateur',
      render: (value: string | null) => value ? `User ${value}` : 'Anonyme'
    },
    {
      key: 'cible_table',
      label: 'Table',
      sortable: true
    },
    {
      key: 'cible_id',
      label: 'ID Cible',
      sortable: true
    },
    {
      key: 'ip_client',
      label: 'Adresse IP',
      sortable: true
    }
  ];

  const filteredData = mockAuditLogs.filter(log => {
    const matchesSearch = log.cible_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.ip_client.includes(searchTerm);
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesDate = dateFilter === 'all' || true; // Simplified for demo
    return matchesSearch && matchesAction && matchesDate;
  });

  const totalLogs = mockAuditLogs.length;
  const todayLogs = mockAuditLogs.filter(log => 
    new Date(log.date_action).toDateString() === new Date().toDateString()
  ).length;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Logs d'audit</h1>
            <p className="text-muted-foreground">Surveillez l'activité du système</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total logs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLogs}</div>
              <p className="text-xs text-muted-foreground">Logs enregistrés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{todayLogs}</div>
              <p className="text-xs text-muted-foreground">Logs aujourd'hui</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activité</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Normal</div>
              <p className="text-xs text-muted-foreground">État du système</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtres</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher par ID ou IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    <SelectItem value={ActionAudit.CONNEXION}>Connexion</SelectItem>
                    <SelectItem value={ActionAudit.CREATION_PERMIS}>Création permis</SelectItem>
                    <SelectItem value={ActionAudit.VALIDATION_PERMIS}>Validation permis</SelectItem>
                    <SelectItem value={ActionAudit.CONNEXION_ECHEC}>Échec connexion</SelectItem>
                  </SelectContent>
                </Select>
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