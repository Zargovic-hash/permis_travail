import React from 'react';
import { useHealthCheck, useSeedData } from '../../hooks/useAdmin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import {
Server,
Database,
HardDrive,
Clock,
CheckCircle,
XCircle,
AlertTriangle,
RefreshCw,
Download
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';export default function AdminPanel() {
const { data: health, isLoading, refetch } = useHealthCheck();
const seedData = useSeedData();const handleSeed = async () => {
if (import.meta.env.VITE_APP_ENV === 'production') {
alert('Action impossible en production');
return;
}if (window.confirm('Charger les données de test ? Cela peut écraser certaines données existantes.')) {
  await seedData.mutateAsync();
}
};return (
<div className="space-y-6">
{/* Header */}
<div className="flex items-center justify-between">
<div>
<h1 className="text-3xl font-bold text-gray-900">Panel Administrateur</h1>
<p className="mt-2 text-sm text-gray-700">
Surveillance et gestion du système
</p>
</div>
<Button
variant="secondary"
icon={RefreshCw}
onClick={() => refetch()}
loading={isLoading}
>
Actualiser
</Button>
</div>  {/* Environment Warning */}
  {import.meta.env.VITE_APP_ENV !== 'production' && (
    <Alert variant="warning">
      <strong>Environnement de développement</strong> - Certaines fonctionnalités sont disponibles uniquement en mode développement.
    </Alert>
  )}  {/* Health Status */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <HealthCard
      title="Serveur"
      icon={Server}
      status={health?.data?.server === 'ok'}
      loading={isLoading}
    />
    <HealthCard
      title="Base de données"
      icon={Database}
      status={health?.data?.database === 'ok'}
      loading={isLoading}
    />
    <HealthCard
      title="Stockage"
      icon={HardDrive}
      status={health?.data?.storage === 'ok'}
      loading={isLoading}
    />
    <HealthCard
      title="API"
      icon={CheckCircle}
      status={health?.data?.api === 'ok'}
      loading={isLoading}
    />
  </div>  {/* System Info */}
  <Card title="Informations système">
    {isLoading ? (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height="40px" />
        ))}
      </div>
    ) : (
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <dt className="text-sm font-medium text-gray-500 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Uptime
          </dt>
          <dd className="mt-1 text-sm text-gray-900 font-mono">
            {health?.data?.uptime || '-'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Version</dt>
          <dd className="mt-1 text-sm text-gray-900 font-mono">
            {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Environnement</dt>
          <dd className="mt-1">
            <Badge variant={import.meta.env.VITE_APP_ENV === 'production' ? 'danger' : 'warning'}>
              {import.meta.env.VITE_APP_ENV || 'development'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Dernière vérification</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {formatDate(new Date(), 'full')}
          </dd>
        </div>
      </dl>
    )}
  </Card>  {/* Statistics */}
  <Card title="Statistiques globales">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <StatItem label="Total Utilisateurs" value={health?.data?.stats?.users || 0} />
      <StatItem label="Total Permis" value={health?.data?.stats?.permis || 0} />
      <StatItem label="Total Zones" value={health?.data?.stats?.zones || 0} />
      <StatItem label="Logs d'Audit" value={health?.data?.stats?.logs || 0} />
    </div>
  </Card>  {/* Actions */}
  <Card title="Actions système">
    <div className="space-y-4">
      {/* Seed Data */}
      {import.meta.env.VITE_APP_ENV !== 'production' && (
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-blue-900">Charger les données de test</h4>
            <p className="text-sm text-blue-700 mt-1">
              Remplit la base de données avec des données de démonstration
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSeed}
            loading={seedData.isPending}
          >
            Charger
          </Button>
        </div>
      )}      {/* Backup */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Sauvegarde de la base de données</h4>
          <p className="text-sm text-gray-600 mt-1">
            Créer une sauvegarde complète du système
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          disabled
        >
          Bientôt disponible
        </Button>
      </div>      {/* Clear Cache */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Vider le cache</h4>
          <p className="text-sm text-gray-600 mt-1">
            Nettoie le cache applicatif et les tokens expirés
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled
        >
          Bientôt disponible
        </Button>
      </div>
    </div>
  </Card>  {/* Logs récents */}
  <Card title="Activité récente">
    <p className="text-sm text-gray-500">
      Les 10 dernières actions système seront affichées ici.
    </p>
  </Card>
</div>
);
}function HealthCard({ title, icon: Icon, status, loading }) {
if (loading) {
return (
<Card>
<Skeleton height="80px" />
</Card>
);
}return (
<Card>
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-gray-500">{title}</p>
<div className="flex items-center mt-2">
{status ? (
<>
<CheckCircle className="w-5 h-5 text-success-500 mr-2" />
<span className="text-sm font-medium text-success-600">Opérationnel</span>
</>
) : (
<>
<XCircle className="w-5 h-5 text-danger-500 mr-2" />
<span className="text-sm font-medium text-danger-600">Hors ligne</span>
</>
)}
</div>
</div>
<div className={`p-3 rounded-full ${status ? 'bg-success-100' : 'bg-danger-100'}`}>
<Icon className={`w-6 h-6 ${status ? 'text-success-600' : 'text-danger-600'}`} />
</div>
</div>
</Card>
);
}function StatItem({ label, value }) {
return (
<div className="text-center">
<p className="text-2xl font-bold text-gray-900">{value}</p>
<p className="text-sm text-gray-500 mt-1">{label}</p>
</div>
);
}