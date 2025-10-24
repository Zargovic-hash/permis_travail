import React, { useState, useEffect } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import { usePagination } from '../../hooks/usePagination';
import { useDebounce } from '../../hooks/useDebounce';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { Search, Shield, Eye, AlertCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export default function AuditLogs() {
  const { page, limit, goToPage, changeLimit, pagination } = usePagination(1, 50);
  
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    cible_table: '',
    date_debut: '',
    date_fin: ''
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 300);

  const { data, isLoading, error, isError } = useAuditLogs(
    { ...filters, search: debouncedSearch },
    pagination
  );

  // ✅ Log pour debugging
  useEffect(() => {
    console.log('🔍 Audit Logs Component State:', {
      isLoading,
      isError,
      error,
      data,
      filters,
      pagination
    });
  }, [data, isLoading, isError, error]);

  const getActionVariant = (action) => {
    if (action.includes('CONNEXION')) return 'info';
    if (action.includes('CREATION')) return 'success';
    if (action.includes('MODIFICATION')) return 'warning';
    if (action.includes('SUPPRESSION') || action.includes('SUSPENSION')) return 'danger';
    return 'default';
  };

  const getCibleIcon = (cible_table) => {
    const icons = {
      'permis': '📄',
      'utilisateurs': '👤',
      'zones': '📍',
      'types_permis': '📋'
    };
    return icons[cible_table] || '📦';
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row) => (
        <span className="text-sm font-mono text-gray-600">#{row.id}</span>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <Badge variant={getActionVariant(row.action)}>
          {row.action}
        </Badge>
      )
    },
    {
      key: 'utilisateur',
      label: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center space-x-3">
          {row.utilisateur_prenom && row.utilisateur_nom ? (
            <>
              <Avatar
                name={`${row.utilisateur_prenom} ${row.utilisateur_nom}`}
                size="sm"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {row.utilisateur_prenom} {row.utilisateur_nom}
                </div>
                <div className="text-xs text-gray-500">{row.utilisateur_email}</div>
              </div>
            </>
          ) : row.utilisateur_id ? (
            <span className="text-sm text-gray-600">ID: {row.utilisateur_id}</span>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-500" />
              </div>
              <span className="text-sm text-gray-500 italic">Système</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'cible',
      label: 'Cible',
      render: (row) => (
        <div className="text-sm">
          {row.cible_nom ? (
            <>
              <div className="font-medium text-gray-900">{row.cible_nom}</div>
              <div className="text-gray-500 text-xs">
                {row.cible_detail && <span className="font-mono">{row.cible_detail}</span>}
                {row.cible_detail && ' • '}
                <span className="text-gray-400">{row.cible_table}</span>
              </div>
            </>
          ) : row.cible_table ? (
            <>
              <div className="font-medium text-gray-700">{row.cible_table}</div>
              {row.cible_id && <div className="text-gray-400 text-xs font-mono">ID: {row.cible_id}</div>}
            </>
          ) : (
            <span className="text-gray-400 italic">Aucune cible</span>
          )}
        </div>
      )
    },
    {
      key: 'ip_client',
      label: 'IP',
      render: (row) => (
        <span className="text-sm font-mono text-gray-600">{row.ip_client || 'N/A'}</span>
      )
    },
    {
      key: 'date_action',
      label: 'Date',
      render: (row) => (
        <div className="text-sm text-gray-900">
          {formatDate(row.date_action, 'full')}
        </div>
      )
    },
    {
      key: 'details',
      label: 'Détails',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedLog(row)}
        >
          Voir
        </Button>
      )
    }
  ];

  // ✅ Extraction correcte des données
  const logsData = data?.data || [];
  const paginationData = data?.pagination || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="bg-primary-600 text-white p-3 rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journaux d'Audit</h1>
          <p className="text-sm text-gray-700 mt-1">
            Historique immuable de toutes les actions du système
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <Input
              icon={Search}
              placeholder="Rechercher par action, utilisateur, IP..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <Select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            options={[
              { value: '', label: 'Toutes les actions' },
              { value: 'CONNEXION', label: 'Connexion' },
              { value: 'CREATION_PERMIS', label: 'Création permis' },
              { value: 'MODIFICATION_PERMIS', label: 'Modification permis' },
              { value: 'VALIDATION_PERMIS', label: 'Validation permis' },
              { value: 'SUSPENSION_PERMIS', label: 'Suspension permis' },
              { value: 'CLOTURE_PERMIS', label: 'Clôture permis' },
              { value: 'SUPPRESSION_UTILISATEUR', label: 'Suppression utilisateur' }
            ]}
          />

          <Select
            value={filters.cible_table}
            onChange={(e) => setFilters({ ...filters, cible_table: e.target.value })}
            options={[
              { value: '', label: 'Toutes les tables' },
              { value: 'permis', label: 'Permis' },
              { value: 'utilisateurs', label: 'Utilisateurs' },
              { value: 'zones', label: 'Zones' },
              { value: 'types_permis', label: 'Types permis' }
            ]}
          />

          <Input
            type="date"
            value={filters.date_debut}
            onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
            placeholder="Date début"
          />

          <Input
            type="date"
            value={filters.date_fin}
            onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
            placeholder="Date fin"
          />
        </div>
      </Card>

      {/* ✅ Message d'erreur si nécessaire */}
      {isError && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Erreur de chargement</p>
              <p className="text-sm">{error?.message || 'Une erreur est survenue'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ✅ Message si aucune donnée */}
      {!isLoading && !isError && logsData.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun log d'audit trouvé</p>
            <p className="text-sm text-gray-500 mt-2">
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        </Card>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={logsData}
        loading={isLoading}
        pagination={paginationData}
        onPageChange={goToPage}
      />

      {/* Pagination controls */}
      {paginationData && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Total: <span className="font-medium">{paginationData.totalCount}</span> entrées
          </div>
          <Select
            value={limit}
            onChange={(e) => changeLimit(Number(e.target.value))}
            options={[
              { value: 25, label: '25 par page' },
              { value: 50, label: '50 par page' },
              { value: 100, label: '100 par page' }
            ]}
            className="w-40"
          />
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Détails du log"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-sm text-gray-900 mt-1">#{selectedLog.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Action</label>
                <p className="mt-1">
                  <Badge variant={getActionVariant(selectedLog.action)}>
                    {selectedLog.action}
                  </Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Utilisateur</label>
                {selectedLog.utilisateur_prenom && selectedLog.utilisateur_nom ? (
                  <div className="mt-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedLog.utilisateur_prenom} {selectedLog.utilisateur_nom}
                    </p>
                    <p className="text-xs text-gray-600">{selectedLog.utilisateur_email}</p>
                  </div>
                ) : selectedLog.utilisateur_id ? (
                  <p className="text-sm text-gray-900 mt-1">ID: {selectedLog.utilisateur_id}</p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1 italic">Système</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IP Client</label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{selectedLog.ip_client}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Table cible</label>
                <p className="text-sm text-gray-900 mt-1">{selectedLog.cible_table || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">ID cible</label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{selectedLog.cible_id || 'N/A'}</p>
              </div>
              {selectedLog.cible_nom && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Nom de la cible</label>
                  <div className="mt-1">
                    <p className="text-sm font-semibold text-gray-900">{selectedLog.cible_nom}</p>
                    {selectedLog.cible_detail && (
                      <p className="text-xs text-gray-600 font-mono mt-1">{selectedLog.cible_detail}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Date et heure</label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(selectedLog.date_action, 'full')}</p>
              </div>
            </div>

            {selectedLog.payload && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Payload (JSON)</label>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800">
                <strong>Note :</strong> Les logs d'audit sont immuables et ne peuvent pas être modifiés ou supprimés.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}