import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Download, Filter, Search, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PermisList() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    zone_id: '',
    type_permis_id: '',
    statut: '',
    date_debut: '',
    date_fin: '',
    demandeur_id: ''
  });

  const { data: permisData, isLoading, error, refetch } = useQuery({
    queryKey: ['permis', page, limit, filters, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });
      return apiClient.get(`/permis?${params.toString()}`);
    },
    staleTime: 2 * 60 * 1000
  });

  const { data: zonesData } = useQuery({
    queryKey: ['zones'],
    queryFn: () => apiClient.get('/zones'),
    staleTime: 10 * 60 * 1000
  });

  const { data: typesData } = useQuery({
    queryKey: ['types-permis'],
    queryFn: () => apiClient.get('/types-permis'),
    staleTime: 10 * 60 * 1000
  });

  const handleExportCSV = async () => {
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
      link.setAttribute('download', `permis-export-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Export CSV téléchargé avec succès');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'export CSV');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      zone_id: '',
      type_permis_id: '',
      statut: '',
      date_debut: '',
      date_fin: '',
      demandeur_id: ''
    });
    setSearch('');
  };

  const canEdit = (permis) => {
    if (!user) return false;
    if (user.role === 'HSE' || user.role === 'ADMIN') return true;
    if (permis.demandeur_id === user.id && ['BROUILLON', 'EN_ATTENTE'].includes(permis.statut)) {
      return true;
    }
    return false;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
            <p className="text-red-600 mb-4 font-medium">Erreur lors du chargement des permis</p>
            <button 
              onClick={() => refetch()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const permis = permisData?.data || [];
  const pagination = permisData?.pagination || {};
  const zones = zonesData?.data || [];
  const types = typesData?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Permis de Travail</h1>
          <p className="mt-2 text-base text-slate-600">
            Gérez tous les permis de travail HSE
          </p>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <a
              href="/permis/nouveau"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Permis
            </a>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors font-medium ${
                showFilters 
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </button>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full sm:w-64 pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Rechercher un permis..."
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium border border-slate-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Filtres</h3>
                {Object.values(filters).filter(v => v).length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                    {Object.values(filters).filter(v => v).length}
                  </span>
                )}
              </div>
              <button
                onClick={handleResetFilters}
                className="text-sm text-slate-600 hover:text-slate-800 font-medium disabled:opacity-50"
                disabled={Object.values(filters).filter(v => v).length === 0}
              >
                <X className="w-4 h-4 inline mr-1" />
                Réinitialiser
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone</label>
                <select
                  value={filters.zone_id}
                  onChange={(e) => setFilters({ ...filters, zone_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">Toutes les zones</option>
                  {zones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de permis</label>
                <select
                  value={filters.type_permis_id}
                  onChange={(e) => setFilters({ ...filters, type_permis_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">Tous les types</option>
                  {types.map(type => (
                    <option key={type.id} value={type.id}>{type.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="BROUILLON">Brouillon</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="VALIDE">Validé</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="SUSPENDU">Suspendu</option>
                  <option value="CLOTURE">Clôturé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                <input
                  type="date"
                  value={filters.date_debut}
                  onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={filters.date_fin}
                  onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          {isLoading ? (
            <LoadingSkeleton />
          ) : permis.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">Aucun permis trouvé</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Numéro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Demandeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Date Début
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Date Fin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {permis.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`/permis/${p.id}`}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                          >
                            {p.numero_permis}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 max-w-xs truncate font-medium" title={p.titre}>
                            {p.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {p.type_permis_nom}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            {p.zone_nom}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {p.demandeur_prenom} {p.demandeur_nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={p.statut} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(p.date_debut).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(p.date_fin).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <a
                              href={`/permis/${p.id}`}
                              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                            >
                              Voir
                            </a>
                            {canEdit(p) && (
                              <a
                                href={`/permis/${p.id}/modifier`}
                                className="text-slate-600 hover:text-slate-800 font-medium transition-colors"
                              >
                                Modifier
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-700">
                        Affichage de{' '}
                        <span className="font-semibold">{(page - 1) * limit + 1}</span>
                        {' '}à{' '}
                        <span className="font-semibold">
                          {Math.min(page * limit, pagination.totalCount)}
                        </span>
                        {' '}sur{' '}
                        <span className="font-semibold">{pagination.totalCount}</span>
                        {' '}résultats
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1);
                        }}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={10}>10 par page</option>
                        <option value={25}>25 par page</option>
                        <option value={50}>50 par page</option>
                        <option value={100}>100 par page</option>
                      </select>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={!pagination.hasPrevPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Précédent
                        </button>
                        {[...Array(pagination.totalPages)].map((_, i) => {
                          const pageNum = i + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === pagination.totalPages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === page
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } else if (pageNum === page - 2 || pageNum === page + 2) {
                            return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">...</span>;
                          }
                          return null;
                        })}
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={!pagination.hasNextPage}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Suivant
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    BROUILLON: { color: 'slate', label: 'Brouillon' },
    EN_ATTENTE: { color: 'amber', label: 'En attente' },
    VALIDE: { color: 'blue', label: 'Validé' },
    EN_COURS: { color: 'emerald', label: 'En cours' },
    SUSPENDU: { color: 'red', label: 'Suspendu' },
    CLOTURE: { color: 'slate', label: 'Clôturé' }
  };
  
  const config = configs[status] || { color: 'slate', label: status };
  
  const colorClasses = {
    slate: 'bg-slate-100 text-slate-800',
    amber: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    red: 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses[config.color]}`}>
      {config.label}
    </span>
  );
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse p-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-slate-200 rounded mb-2"></div>
      ))}
    </div>
  );
}