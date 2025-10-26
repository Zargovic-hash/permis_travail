import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  AlertCircle
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
import { toast } from 'react-toastify';

export default function Reports() {
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    zone_id: '',
    type_permis_id: '',
    statut: ''
  });

  // Récupération des statistiques
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => apiClient.get('/reports/statistiques'),
    staleTime: 5 * 60 * 1000
  });

  // Récupération des zones (pour le filtre)
  const { data: zonesData } = useQuery({
    queryKey: ['zones-select'],
    queryFn: () => apiClient.get('/zones'),
    staleTime: 10 * 60 * 1000
  });

  // Récupération des types de permis (pour le filtre)
  const { data: typesData } = useQuery({
    queryKey: ['types-permis-select'],
    queryFn: () => apiClient.get('/types-permis'),
    staleTime: 10 * 60 * 1000
  });

  // Export CSV
  const handleExport = async () => {
    try {
      const params = new URLSearchParams(
        Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      );
      const response = await apiClient.get(`/reports/export-csv?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-permis-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Rapport exporté avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de l\'export');
    }
  };

  // Extraction des données
  const stats = statsData?.data?.statistiques_globales || {};
  const parZone = statsData?.data?.par_zone || [];
  const parType = statsData?.data?.par_type || [];
  const parMois = statsData?.data?.par_mois || [];
  const tempsApprobation = stats?.temps_approbation_moyen || 0;

  // Zones et types pour les filtres
  const zones = zonesData?.data?.data || zonesData?.data || [];
  const types = typesData?.data?.data || typesData?.data || [];

  // Données pour le pie chart des statuts
  const statutsData = [
    { name: 'Actifs', value: stats.permis_actifs || 0, color: '#10b981' },
    { name: 'Validés', value: stats.permis_valides || 0, color: '#3b82f6' },
    { name: 'En attente', value: stats.permis_en_attente || 0, color: '#f59e0b' },
    { name: 'Suspendus', value: stats.permis_suspendus || 0, color: '#ef4444' },
    { name: 'Clôturés', value: stats.permis_clotures || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Gestion des erreurs
  if (statsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Erreur de chargement</h3>
            <p className="text-red-700 text-sm mt-1">Impossible de récupérer les statistiques</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Rapports et Statistiques</h1>
          <p className="mt-2 text-sm text-gray-700">
            Analysez l'activité et les tendances des permis de travail HSE
          </p>
        </div>
        <Button
          variant="primary"
          icon={Download}
          onClick={handleExport}
          className="shadow-sm"
        >
          Exporter en CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            type="date"
            label="Date de début"
            value={filters.date_debut}
            onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
          />
          <Input
            type="date"
            label="Date de fin"
            value={filters.date_fin}
            onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
          />
          <Select
            label="Zone"
            value={filters.zone_id}
            onChange={(e) => setFilters({ ...filters, zone_id: e.target.value })}
            options={[
              { value: '', label: 'Toutes les zones' },
              ...(zones.map(z => ({
                value: z.id,
                label: z.nom
              })) || [])
            ]}
          />
          <Select
            label="Type de permis"
            value={filters.type_permis_id}
            onChange={(e) => setFilters({ ...filters, type_permis_id: e.target.value })}
            options={[
              { value: '', label: 'Tous les types' },
              ...(types.map(t => ({
                value: t.id,
                label: t.nom
              })) || [])
            ]}
          />
          <Select
            label="Statut"
            value={filters.statut}
            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'BROUILLON', label: 'Brouillon' },
              { value: 'EN_ATTENTE', label: 'En attente' },
              { value: 'VALIDE', label: 'Validé' },
              { value: 'EN_COURS', label: 'En cours' },
              { value: 'SUSPENDU', label: 'Suspendu' },
              { value: 'CLOTURE', label: 'Clôturé' }
            ]}
          />
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Permis"
          value={stats.total_permis || 0}
          icon={FileText}
          color="bg-blue-500"
          loading={statsLoading}
        />
        <StatCard
          title="Permis Actifs"
          value={stats.permis_actifs || 0}
          icon={TrendingUp}
          color="bg-green-500"
          loading={statsLoading}
        />
        <StatCard
          title="En Attente"
          value={stats.permis_en_attente || 0}
          icon={Calendar}
          color="bg-yellow-500"
          loading={statsLoading}
        />
        <StatCard
          title="Validés"
          value={stats.permis_valides || 0}
          icon={PieChartIcon}
          color="bg-purple-500"
          loading={statsLoading}
        />
        <StatCard
          title="Clôturés"
          value={stats.permis_clotures || 0}
          icon={BarChart3}
          color="bg-gray-500"
          loading={statsLoading}
        />
      </div>

      {/* Temps d'approbation moyen */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Temps d'approbation moyen</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {statsLoading ? (
                <Skeleton width="100px" height="36px" />
              ) : (
                `${tempsApprobation.toFixed(1)} heures`
              )}
            </p>
          </div>
          <div className="bg-blue-100 p-4 rounded-full">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolution par mois */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
          {statsLoading ? (
            <Skeleton height="300px" />
          ) : parMois.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={parMois}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="mois" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="nombre_permis" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Nombre de permis"
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Répartition par statut */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par statut</h3>
          {statsLoading ? (
            <Skeleton height="300px" />
          ) : statutsData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statutsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statutsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Permis par zone */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution par zone</h3>
          {statsLoading ? (
            <Skeleton height="300px" />
          ) : parZone.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={parZone}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="zone" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="nombre_permis" 
                  fill="#3b82f6" 
                  name="Total" 
                  radius={[8, 8, 0, 0]} 
                />
                <Bar 
                  dataKey="actifs" 
                  fill="#10b981" 
                  name="Actifs" 
                  radius={[8, 8, 0, 0]} 
                />
                <Bar 
                  dataKey="clotures" 
                  fill="#6b7280" 
                  name="Clôturés" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Permis par type */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribution par type</h3>
          {statsLoading ? (
            <Skeleton height="300px" />
          ) : parType.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-gray-500">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={parType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis 
                  dataKey="type" 
                  type="category" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  width={120}
                />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="nombre_permis" 
                  fill="#8b5cf6" 
                  name="Total" 
                  radius={[0, 8, 8, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table par zone */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails par zone</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actifs</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clôturés</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                    </tr>
                  ))
                ) : parZone.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  parZone.map((zone, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {zone.zone || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                        {zone.nombre_permis || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">
                        {zone.actifs || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {zone.clotures || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Table par type */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails par type</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actifs</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clôturés</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {statsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                    </tr>
                  ))
                ) : parType.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      Aucune donnée
                    </td>
                  </tr>
                ) : (
                  parType.map((type, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {type.type || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                        {type.nombre_permis || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right font-semibold">
                        {type.actifs || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {type.clotures || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * Composant StatCard - Affiche une statistique avec icône
 */
function StatCard({ title, value, icon: Icon, color, loading }) {
  if (loading) {
    return (
      <Card>
        <Skeleton height="100px" />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}