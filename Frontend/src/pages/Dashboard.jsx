import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { 
  RefreshCw, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  User,
  Building2,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function DashboardZonesPermis() {
  const [selectedStatut, setSelectedStatut] = useState('');
  const [selectedPermis, setSelectedPermis] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Récupération des zones
  const { 
    data: zonesData, 
    isLoading: zonesLoading, 
    error: zonesError,
    refetch: refetchZones 
  } = useQuery({
    queryKey: ['zones-dashboard'],
    queryFn: () => apiClient.get('/zones'),
    staleTime: 5 * 60 * 1000
  });

  const zones = zonesData?.data || [];

  // Récupération des permis pour chaque zone
  const { 
    data: permisDataByZone = {}, 
    isLoading: permisLoading,
    refetch: refetchPermis
  } = useQuery({
    queryKey: ['permis-by-zone', zones.map(z => z.id).join(',')],
    queryFn: async () => {
      const result = {};
      for (const zone of zones) {
        const res = await apiClient.get(`/permis?zone_id=${zone.id}`);
        result[zone.id] = res.data || [];
      }
      return result;
    },
    enabled: zones.length > 0,
    staleTime: 3 * 60 * 1000
  });

  // Statuts avec couleurs et icônes
  const statusConfig = {
    EN_COURS: { 
      color: 'border-emerald-500 bg-emerald-50', 
      label: 'En cours',
      icon: Clock,
      textColor: 'text-emerald-700'
    },
    VALIDE: { 
      color: 'border-blue-500 bg-blue-50', 
      label: 'Validé',
      icon: CheckCircle,
      textColor: 'text-blue-700'
    },
    SUSPENDU: { 
      color: 'border-red-500 bg-red-50', 
      label: 'Suspendu',
      icon: Ban,
      textColor: 'text-red-700'
    },
    CLOTURE: { 
      color: 'border-slate-400 bg-slate-50', 
      label: 'Clôturé',
      icon: CheckCircle,
      textColor: 'text-slate-700'
    },
    EN_ATTENTE: { 
      color: 'border-amber-500 bg-amber-50', 
      label: 'En attente',
      icon: AlertTriangle,
      textColor: 'text-amber-700'
    },
    BROUILLON: { 
      color: 'border-gray-400 bg-gray-50', 
      label: 'Brouillon',
      icon: AlertCircle,
      textColor: 'text-gray-700'
    }
  };

  // Permis filtrés selon le statut sélectionné
  const permisFiltered = useMemo(() => {
    const result = {};
    Object.entries(permisDataByZone).forEach(([zoneId, permis]) => {
      if (selectedStatut) {
        result[zoneId] = permis.filter(p => p.statut === selectedStatut);
      } else {
        result[zoneId] = permis;
      }
    });
    return result;
  }, [permisDataByZone, selectedStatut]);

  // Statistiques globales
  const stats = useMemo(() => {
    const allPermis = Object.values(permisFiltered).flat();
    return {
      total: allPermis.length,
      enCours: allPermis.filter(p => p.statut === 'EN_COURS').length,
      valides: allPermis.filter(p => p.statut === 'VALIDE').length,
      suspendus: allPermis.filter(p => p.statut === 'SUSPENDU').length
    };
  }, [permisFiltered]);

  // Gestion du refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchZones(), refetchPermis()]);
      toast.success('Données actualisées');
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gestion erreurs
  if (zonesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center space-x-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Erreur de chargement</h3>
            <p className="text-red-700 text-sm mt-1">Impossible de récupérer les zones</p>
          </div>
          <button
            onClick={handleRefresh}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          📍 Suivi des Permis par Zone
        </h1>
        <p className="text-slate-600">
          Visualisez l'état des permis de travail HSE pour chaque zone de votre site
        </p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-200">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-sm font-medium text-slate-700">Filtrer par statut:</label>
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing || zonesLoading || permisLoading}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Permis" 
          value={stats.total} 
          icon={MapPin}
          color="indigo"
        />
        <StatCard 
          title="En Cours" 
          value={stats.enCours} 
          icon={Clock}
          color="emerald"
        />
        <StatCard 
          title="Validés" 
          value={stats.valides} 
          icon={CheckCircle}
          color="blue"
        />
        <StatCard 
          title="Suspendus" 
          value={stats.suspendus} 
          icon={Ban}
          color="red"
        />
      </div>

      {/* Loading State */}
      {(zonesLoading || permisLoading) && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="h-12 bg-slate-100 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zones Grid */}
      {!zonesLoading && !permisLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const zonePermis = permisFiltered[zone.id] || [];
            return (
              <ZoneCard 
                key={zone.id}
                zone={zone}
                permis={zonePermis}
                statusConfig={statusConfig}
                onSelectPermis={setSelectedPermis}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!zonesLoading && zones.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Aucune zone trouvée</p>
        </div>
      )}

      {/* Permis Details Modal */}
      {selectedPermis && (
        <PermisModal 
          permis={selectedPermis}
          statusConfig={statusConfig}
          onClose={() => setSelectedPermis(null)}
        />
      )}
    </div>
  );
}

// Composant Zone Card
function ZoneCard({ zone, permis, statusConfig, onSelectPermis }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow">
      {/* Header Zone */}
      <div className="flex items-start space-x-4 mb-5 pb-4 border-b border-slate-200">
        <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{zone.nom}</h3>
          <p className="text-sm text-slate-500 mt-1">{zone.description}</p>
          <div className="flex items-center space-x-2 mt-2 text-xs text-slate-600">
            <User className="w-4 h-4" />
            <span>{zone.responsable_prenom} {zone.responsable_nom}</span>
          </div>
        </div>
      </div>

      {/* Permis List */}
      <div className="space-y-2">
        {permis.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-4">Aucun permis</p>
        ) : (
          permis.map((p) => {
            const config = statusConfig[p.statut] || statusConfig.BROUILLON;
            const Icon = config.icon;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPermis(p)}
                className={`w-full rounded-lg p-3 border-l-4 shadow-sm hover:shadow-md transition-all text-left ${config.color} hover:scale-105 transform`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${config.textColor}`} />
                      <span className="font-semibold text-sm text-slate-900 truncate">
                        {p.numero_permis}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-1">
                      {p.type_permis_nom}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-slate-700">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(p.date_debut).toLocaleDateString('fr-FR')}</span>
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 ml-2 ${config.textColor}`} />
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Badge Permis Count */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {permis.length} permis
        </span>
      </div>
    </div>
  );
}

// Composant Permis Modal
function PermisModal({ permis, statusConfig, onClose }) {
  const config = statusConfig[permis.statut] || statusConfig.BROUILLON;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        {/* Header */}
        <div className={`rounded-lg p-4 mb-6 ${config.color} flex items-start space-x-3`}>
          <Icon className={`w-6 h-6 flex-shrink-0 ${config.textColor}`} />
          <div>
            <h3 className="font-bold text-lg text-slate-900">{permis.numero_permis}</h3>
            <p className="text-sm text-slate-600 mt-1">{config.label}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <DetailRow label="Type" value={permis.type_permis_nom} />
          <DetailRow 
            label="Demandeur" 
            value={`${permis.demandeur_prenom} ${permis.demandeur_nom}`}
          />
          <DetailRow 
            label="Début" 
            value={new Date(permis.date_debut).toLocaleDateString('fr-FR')}
          />
          <DetailRow 
            label="Fin" 
            value={new Date(permis.date_fin).toLocaleDateString('fr-FR')}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// Composant Stat Card
function StatCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// Composant Detail Row
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm font-medium text-slate-600">{label}:</span>
      <span className="text-sm text-slate-900 font-semibold">{value}</span>
    </div>
  );
}