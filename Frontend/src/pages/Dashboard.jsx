import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Vraies requêtes API vers le backend
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => apiClient.get('/reports/statistiques'),
    staleTime: 5 * 60 * 1000
  });

  const { data: recentPermis, isLoading: permisLoading } = useQuery({
    queryKey: ['permis', 'recent'],
    queryFn: () => apiClient.get('/permis?limit=5&page=1'),
    staleTime: 5 * 60 * 1000
  });

  if (statsLoading || permisLoading) {
    return <LoadingSkeleton />;
  }

  // Accès correct aux données retournées par apiClient
  const globalStats = stats?.data?.statistiques_globales || {};
  const parZone = stats?.data?.par_zone || [];
  const parType = stats?.data?.par_type || [];
  const parMois = stats?.data?.par_mois || [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Voici un aperçu de l'activité des permis de travail
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Permis"
          value={globalStats.total_permis || 0}
          icon={FileText}
          color="blue"
        />
        <KPICard
          title="Permis Actifs"
          value={globalStats.permis_actifs || 0}
          icon={Clock}
          color="green"
          trend="+12%"
        />
        <KPICard
          title="En Attente"
          value={globalStats.permis_en_attente || 0}
          icon={AlertTriangle}
          color="orange"
        />
        <KPICard
          title="Validés"
          value={globalStats.permis_valides || 0}
          icon={CheckCircle}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart - Evolution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Évolution sur 12 mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={parMois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="nombre_permis" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Nombre de permis"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Par Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Répartition par type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={parType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="nombre_permis"
              >
                {parType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart - Par Zone */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h3 className="text-lg font-semibold mb-4">Permis par zone</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={parZone}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="zone" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="nombre_permis" fill="#3b82f6" name="Total" />
            <Bar dataKey="actifs" fill="#10b981" name="Actifs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Permits Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Permis récents</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Numéro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPermis?.data?.map((permis) => (
                <tr 
                  key={permis.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/permis/${permis.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {permis.numero_permis}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {permis.titre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {permis.zone_nom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={permis.statut} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(permis.date_creation).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    BROUILLON: { color: 'gray', label: 'Brouillon' },
    EN_ATTENTE: { color: 'yellow', label: 'En attente' },
    VALIDE: { color: 'blue', label: 'Validé' },
    EN_COURS: { color: 'green', label: 'En cours' },
    SUSPENDU: { color: 'red', label: 'Suspendu' },
    CLOTURE: { color: 'gray', label: 'Clôturé' }
  };
  
  const { color, label } = configs[status] || { color: 'gray', label: status };
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800`}>
      {label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
          ))}
        </div>
      </div>
    </div>
  );
}