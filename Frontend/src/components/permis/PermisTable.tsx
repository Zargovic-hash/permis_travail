import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Download, MoreVertical, XCircle, CheckCircle } from 'lucide-react';
import { DataTable } from '../common/DataTable';
import { Permis } from '../../types';
import { formatDate, formatFullName } from '../../utils/formatters';
import { STATUT_COLORS, STATUT_LABELS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { canEditPermis, canValidatePermis, canSuspendPermis } from '../../utils/permissions';

interface PermisTableProps {
  data: Permis[];
  loading: boolean;
  pagination?: any;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
}

export const PermisTable: React.FC<PermisTableProps> = ({
  data,
  loading,
  pagination,
  onPageChange,
  onSort
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const columns = [
    {
      key: 'numero_permis',
      label: 'Numéro',
      sortable: true,
      render: (permis: Permis) => (
        <button
          onClick={() => navigate(`/permis/${permis.id}`)}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {permis.numero_permis}
        </button>
      )
    },
    {
      key: 'titre',
      label: 'Titre',
      sortable: true,
      render: (permis: Permis) => (
        <div className="max-w-xs">
          <p className="truncate font-medium">{permis.titre}</p>
          <p className="text-xs text-gray-500 truncate">{permis.description}</p>
        </div>
      )
    },
    {
      key: 'type_permis_nom',
      label: 'Type',
      render: (permis: Permis) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {permis.type_permis_nom}
        </span>
      )
    },
    {
      key: 'zone_nom',
      label: 'Zone',
      render: (permis: Permis) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {permis.zone_nom}
        </span>
      )
    },
    {
      key: 'demandeur',
      label: 'Demandeur',
      render: (permis: Permis) => formatFullName(permis.demandeur_prenom, permis.demandeur_nom)
    },
    {
      key: 'statut',
      label: 'Statut',
      sortable: true,
      render: (permis: Permis) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUT_COLORS[permis.statut]}`}>
          {STATUT_LABELS[permis.statut]}
        </span>
      )
    },
    {
      key: 'date_debut',
      label: 'Date début',
      sortable: true,
      render: (permis: Permis) => formatDate(permis.date_debut)
    },
    {
      key: 'date_fin',
      label: 'Date fin',
      sortable: true,
      render: (permis: Permis) => formatDate(permis.date_fin)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (permis: Permis) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/permis/${permis.id}`)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </button>

          {canEditPermis(user, permis) && (
            <button
              onClick={() => navigate(`/permis/${permis.id}/modifier`)}
              className="p-1 text-gray-600 hover:text-yellow-600 transition-colors"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {canValidatePermis(user, permis) && (
            <button
              onClick={() => navigate(`/permis/${permis.id}/valider`)}
              className="p-1 text-gray-600 hover:text-green-600 transition-colors"
              title="Valider"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}

          {canSuspendPermis(user) && permis.statut === 'EN_COURS' && (
            <button
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
              title="Suspendre"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          <button
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            title="Plus d'options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      pagination={pagination}
      onPageChange={onPageChange}
      onSort={onSort}
      emptyMessage="Aucun permis trouvé"
    />
  );
};