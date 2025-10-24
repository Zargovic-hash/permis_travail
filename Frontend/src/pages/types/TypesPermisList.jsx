import React, { useState } from 'react';
import { 
  useTypesPermis, 
  useCreateTypePermis, 
  useUpdateTypePermis, 
  useDeleteTypePermis 
} from '../../hooks/useTypesPermis';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, Clipboard, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function TypesPermisList() {
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteTypeId, setDeleteTypeId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });

  const { data: types, isLoading } = useTypesPermis();
  const createType = useCreateTypePermis();
  const updateType = useUpdateTypePermis(editingType?.id);
  const deleteType = useDeleteTypePermis();

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type);
      setFormData({
        nom: type.nom,
        description: type.description || ''
      });
    } else {
      setEditingType(null);
      setFormData({ nom: '', description: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
    setFormData({ nom: '', description: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      toast.error('Le nom du type est requis');
      return;
    }

    try {
      if (editingType) {
        await updateType.mutateAsync(formData);
      } else {
        await createType.mutateAsync(formData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteType.mutateAsync(deleteTypeId);
      setDeleteTypeId(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Type de permis',
      render: (row) => (
        <div className="flex items-center">
          <Clipboard className="w-4 h-4 text-gray-400 mr-2" />
          <span className="font-medium text-gray-900">{row.nom}</span>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.description || 'Aucune description'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit}
            onClick={() => handleOpenModal(row)}
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteTypeId(row.id)}
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types de Permis</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gérez les différents types de permis de travail
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleOpenModal()}
        >
          Nouveau Type
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height="60px" />
            ))}
          </div>
        </Card>
      ) : types?.data?.length === 0 ? (
        <Card>
          <EmptyState
            icon={Clipboard}
            title="Aucun type de permis"
            description="Commencez par créer votre premier type de permis"
            action={
              <Button variant="primary" onClick={() => handleOpenModal()}>
                Créer un type
              </Button>
            }
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={types?.data || []}
          loading={isLoading}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingType ? 'Modifier le type' : 'Nouveau type'}
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={createType.isPending || updateType.isPending}
            >
              {editingType ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom du type"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
            placeholder="Ex: Permis Feu"
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Décrivez le type de permis et ses spécificités..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTypeId}
        onClose={() => setDeleteTypeId(null)}
        onConfirm={handleDelete}
        title="Supprimer le type"
        message="Êtes-vous sûr de vouloir supprimer ce type de permis ? Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deleteType.isPending}
      />
    </div>
  );
}