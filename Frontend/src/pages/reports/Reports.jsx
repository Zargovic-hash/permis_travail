import React, { useState } from 'react';
import { useStatistiques, useExportCSV } from '../../hooks/useReports';
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
  Calendar
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
import { formatNumber } from '../../utils/formatters';

export default function Reports() {
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    zone_id: '',
    type_permis_id: '',
    statut: ''
  });

  const { data: stats, isLoading } = useStatistiques();
  const exportCSV = useExportCSV();

  const handleExport = async () => {
    await exportCSV.mutateAsync(filters);
  };

  const globalStats = stats?.data?.statistiques_globales || {};
  const parZone = stats?.data?.par_zone || [];
  const parType = stats?.data?.par_type || [];
  const parMois = stats?.data?.par_mois || [];
  const tempsApprobation = stats?.data?.temps_approbation_moyen || 0;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Données pour le pie chart des statuts
  const statutsData = [
    { name: 'Actifs', value: globalStats.permis_actifs || 0, color: '#10b981' },
    { name: 'Validés', value: globalStats.permis_valides || 0, color: '#3b82f6' },
    { name: 'En attente', value: globalStats.permis_en_attente || 0, color: '#f59e0b' },
    { name: 'Suspendus', value: globalStats.permis_suspendus || 0, color: '#ef4444' },
    { name: 'Clôturés', value: globalStats.permis_clotures || 0, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Statistiques</h1>
          <p className="mt-2 text-sm text-gray-700">
            Analysez l'activité et les tendances des permis de travail
          </p>
        </div>
        <Button
          variant="primary"
          icon={Download}
          onClick={handleExport}
          loading={exportCSV.isPending}
        >
          Exporter les données
        </Button>
      </div>

      {/* Filters */}
      <Card title="Filtres de période">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Permis"
          value={globalStats.total_permis || 0}
          icon={FileText}
          color="bg-blue-500"
          loading={isLoading}
        />
        <StatCard
          title="Actifs"
          value={globalStats.permis_actifs || 0}
          icon={TrendingUp}
          color="bg-green-500"
          loading={isLoading}
        />
        <StatCard
          title="En Attente"
          value={globalStats.permis_en_attente || 0}
          icon={Calendar}
          color="bg-yellow-500"
          loading={isLoading}
        />
        <StatCard
          title="Validés"
          value={globalStats.permis_valides || 0}
          icon={PieChartIcon}
          color="bg-purple-500"
          loading={isLoading}
        />
        <StatCard
          title="Clôturés"
          value={globalStats.permis_clotures || 0}
          icon={BarChart3}
          color="bg-gray-500"
          loading={isLoading}
        />
      </div>

      {/* Temps d'approbation moyen */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Temps d'approbation moyen</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {isLoading ? (
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
        <Card title="Évolution mensuelle">
          {isLoading ? (
            <Skeleton height="300px" />
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
        <Card title="Répartition par statut">
          {isLoading ? (
            <Skeleton height="300px" />
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
        <Card title="Distribution par zone">
          {isLoading ? (
            <Skeleton height="300px" />
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
                <Bar dataKey="nombre_permis" fill="#3b82f6" name="Total" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actifs" fill="#10b981" name="Actifs" radius={[8, 8, 0, 0]} />
                <Bar dataKey="clotures" fill="#6b7280" name="Clôturés" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Permis par type */}
        <Card title="Distribution par type">
          {isLoading ? (
            <Skeleton height="300px" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={parType} layout="horizontal">
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
                <Bar dataKey="nombre_permis" fill="#8b5cf6" name="Total" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table par zone */}
        <Card title="Détails par zone">
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
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                    </tr>
                  ))
                ) : (
                  parZone.map((zone, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{zone.zone}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {formatNumber(zone.nombre_permis)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">
                        {formatNumber(zone.actifs)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {formatNumber(zone.clotures)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Table par type */}
        <Card title="Détails par type">
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
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                      <td className="px-4 py-3"><Skeleton /></td>
                    </tr>
                  ))
                ) : (
                  parType.map((type, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{type.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                        {formatNumber(type.nombre_permis)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600 text-right">
                        {formatNumber(type.actifs)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-right">
                        {formatNumber(type.clotures)}
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
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatNumber(value)}</p>
        </div>
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
}