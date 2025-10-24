import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUtilisateurs, useDeleteUtilisateur } from '../../hooks/useUtilisateurs';
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
import Switch from '../../components/ui/Switch';
import { Skeleton } from '../../components/ui/Skeleton';
import { Search, UserPlus, Eye, Edit, Trash2, ShieldAlert, Users } from 'lucide-react';
import { getRoleLabel, getRoleBadgeColor, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

export default function UtilisateursList() {
  const navigate = useNavigate();
  const { page, limit, goToPage, pagination } = usePagination(1, 10);
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    actif: ''
  });
  const [deleteUser, setDeleteUser] = useState(null);
  const [anonymize, setAnonymize] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 300);

  const { data, isLoading } = useUtilisateurs(
    { 
      ...filters, 
      search: debouncedSearch,
      role: filters.role || undefined,
      actif: filters.actif || undefined
    },
    pagination
  );

  const deleteUtilisateur = useDeleteUtilisateur();

  const handleDelete = async () => {
    try {
      await deleteUtilisateur.mutateAsync({ 
        id: deleteUser.id, 
        anonymiser: anonymize 
      });
      toast.success(anonymize ? 'Utilisateur anonymisé avec succès' : 'Utilisateur supprimé avec succès');
      setDeleteUser(null);
      setAnonymize(false);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const columns = [
    {
      key: 'utilisateur',
      label: 'Utilisateur',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <Avatar
            name={`${row.prenom} ${row.nom}`}
            size="md"
          />
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {row.prenom} {row.nom}
            </div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(row.role)}`}>
          {getRoleLabel(row.role)}
        </span>
      )
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (row) => (
        <span className="text-sm text-gray-900">
          {row.telephone || '-'}
        </span>
      )
    },
    {
      key: 'actif',
      label: 'Statut',
      render: (row) => (
        <Badge variant={row.actif ? 'success' : 'danger'}>
          {row.actif ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
    {
      key: 'date_creation',
      label: 'Inscription',
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.date_creation, 'date')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/utilisateurs/${row.id}`)}
            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
          >
            Voir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => navigate(`/utilisateurs/${row.id}/modifier`)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteUser(row)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => navigate('/utilisateurs/nouveau')}
          className="shadow-sm"
        >
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            icon={Search}
            placeholder="Rechercher par nom ou email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />

          <Select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            options={[
              { value: '', label: 'Tous les rôles' },
              { value: 'DEMANDEUR', label: 'Demandeur' },
              { value: 'SUPERVISEUR', label: 'Superviseur' },
              { value: 'RESP_ZONE', label: 'Responsable de Zone' },
              { value: 'HSE', label: 'HSE' },
              { value: 'ADMIN', label: 'Administrateur' }
            ]}
          />

          <Select
            value={filters.actif}
            onChange={(e) => setFilters({ ...filters, actif: e.target.value })}
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'true', label: 'Actifs' },
              { value: 'false', label: 'Inactifs' }
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="60px" />
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <DataTable
            columns={columns}
            data={data?.data?.data || []}
            loading={isLoading}
            pagination={data?.data?.pagination}
            onPageChange={goToPage}
          />
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteUser}
        onClose={() => {
          setDeleteUser(null);
          setAnonymize(false);
        }}
        title={
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <span>Supprimer l'utilisateur</span>
          </div>
        }
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteUser(null);
                setAnonymize(false);
              }}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteUtilisateur.isPending}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <p className="text-sm text-gray-700">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong className="text-gray-900">{deleteUser?.prenom} {deleteUser?.nom}</strong> ?
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-900">Conformité RGPD</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Vous pouvez choisir d'anonymiser les données de l'utilisateur au lieu de les supprimer définitivement.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <Switch
              label="Anonymiser les données (recommandé pour RGPD)"
              checked={anonymize}
              onChange={setAnonymize}
            />
            {anonymize && (
              <p className="text-xs text-gray-500 mt-2 ml-11">
                Les données personnelles seront remplacées par des valeurs anonymes tout en conservant l'historique des actions.
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}