import { useState } from 'react';
import { Settings, Database, Users, Shield, BarChart3, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';

export default function Admin() {
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    storage: 'online',
    email: 'offline'
  });

  const adminStats = {
    totalUsers: 45,
    activeUsers: 42,
    totalPermis: 156,
    pendingApprovals: 8,
    systemUptime: '99.9%',
    lastBackup: '2024-01-15 02:00:00'
  };

  const recentActivities = [
    { id: 1, action: 'Nouvel utilisateur créé', user: 'Marie Martin', time: 'Il y a 5 min' },
    { id: 2, action: 'Permis validé', user: 'Jean Dupont', time: 'Il y a 12 min' },
    { id: 3, action: 'Zone mise à jour', user: 'Pierre Durand', time: 'Il y a 1h' },
    { id: 4, action: 'Sauvegarde effectuée', user: 'Système', time: 'Il y a 2h' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'En ligne';
      case 'offline': return 'Hors ligne';
      case 'warning': return 'Attention';
      default: return 'Inconnu';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">Panneau d'administration du système</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Sauvegarde
            </Button>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              État du système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Base de données</span>
                </div>
                <Badge className={getStatusColor(systemStatus.database)}>
                  {getStatusLabel(systemStatus.database)}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">API</span>
                </div>
                <Badge className={getStatusColor(systemStatus.api)}>
                  {getStatusLabel(systemStatus.api)}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Stockage</span>
                </div>
                <Badge className={getStatusColor(systemStatus.storage)}>
                  {getStatusLabel(systemStatus.storage)}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Email</span>
                </div>
                <Badge className={getStatusColor(systemStatus.email)}>
                  {getStatusLabel(systemStatus.email)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {adminStats.activeUsers} actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Permis</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminStats.totalPermis}</div>
              <p className="text-xs text-muted-foreground">
                {adminStats.pendingApprovals} en attente
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{adminStats.systemUptime}</div>
              <p className="text-xs text-muted-foreground">Uptime système</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière sauvegarde</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{adminStats.lastBackup}</div>
              <p className="text-xs text-muted-foreground">Sauvegarde automatique</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <h4 className="font-medium">{activity.action}</h4>
                      <p className="text-sm text-muted-foreground">par {activity.user}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-20 flex-col">
                <Database className="h-6 w-6 mb-2" />
                Sauvegarde manuelle
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Gérer utilisateurs
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Settings className="h-6 w-6 mb-2" />
                Configuration
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Shield className="h-6 w-6 mb-2" />
                Logs système
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}