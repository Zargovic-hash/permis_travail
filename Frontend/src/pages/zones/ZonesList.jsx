import React, { useState } from 'react';
import { useZones, useCreateZone, useUpdateZone, useDeleteZone } from '../../hooks/useZones';
import { useUtilisateurs } from '../../hooks/useUtilisateurs';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { Plus, MapPin, Edit, Trash2, User, Building2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ZonesList() {
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [deleteZoneId, setDeleteZoneId] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    responsable_id: ''
  });
  const [errors, setErrors] = useState({});

  const { data: zones, isLoading } = useZones();
  const { data: utilisateurs } = useUtilisateurs({}, { page: 1, limit: 1000 });
  const createZone = useCreateZone();
  const updateZone = useUpdateZone(editingZone?.id);
  const deleteZone = useDeleteZone();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom || formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (!formData.responsable_id) {
      newErrors.responsable_id = 'Le responsable est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setEditingZone(zone);
      setFormData({
        nom: zone.nom,
        description: zone.description || '',
        responsable_id: zone.responsable_id || ''
      });
    } else {
      setEditingZone(null);
      setFormData({ nom: '', description: '', responsable_id: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingZone(null);
    setFormData({ nom: '', description: '', responsable_id: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    try {
      if (editingZone) {
        await updateZone.mutateAsync(formData);
        toast.success('Zone modifiée avec succès');
      } else {
        await createZone.mutateAsync(formData);
        toast.success('Zone créée avec succès');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteZone.mutateAsync(deleteZoneId);
      toast.success('Zone supprimée avec succès');
      setDeleteZoneId(null);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Zone',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{row.nom}</div>
            <div className="text-xs text-gray-500">ID: {row.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => (
        <span className="text-sm text-gray-600">
          {row.description || <span className="italic text-gray-400">Aucune description</span>}
        </span>
      )
    },
    {
      key: 'responsable',
      label: 'Responsable',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {row.responsable_prenom} {row.responsable_nom}
            </div>
          </div>
        </div>
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
            icon={Edit}
            onClick={() => handleOpenModal(row)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteZoneId(row.id)}
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Zones</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez les zones de travail et leurs responsables
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleOpenModal()}
          className="shadow-sm"
        >
          Nouvelle Zone
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
      ) : zones?.data?.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Aucune zone"
            description="Commencez par créer votre première zone de travail"
            action={
              <Button variant="primary" icon={Plus} onClick={() => handleOpenModal()}>
                Créer une zone
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <DataTable
            columns={columns}
            data={zones?.data || []}
            loading={isLoading}
          />
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span>{editingZone ? 'Modifier la zone' : 'Nouvelle zone'}</span>
          </div>
        }
        size="md"
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
              loading={createZone.isPending || updateZone.isPending}
            >
              {editingZone ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info Alert */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Information</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Les zones permettent d'organiser les espaces de travail et d'assigner des responsables.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Nom de la zone"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
            placeholder="Ex: Atelier de production"
            error={errors.nom}
            icon={Building2}
          />

          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            placeholder="Décrivez la zone et ses particularités..."
            helper="Optionnel - Ajoutez des détails pour mieux identifier la zone"
          />

          <Select
            label="Responsable de zone"
            value={formData.responsable_id}
            onChange={(e) => setFormData({ ...formData, responsable_id: e.target.value })}
            required
            error={errors.responsable_id}
            icon={User}
            options={[
              { value: '', label: 'Sélectionner un responsable' },
              ...((utilisateurs?.data?.data?.data || utilisateurs?.data?.data || []).map(u => ({
                value: u.id,
                label: `${u.prenom} ${u.nom} - ${u.role}`
              })) || [])
            ]}
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteZoneId}
        onClose={() => setDeleteZoneId(null)}
        onConfirm={handleDelete}
        title="Supprimer la zone"
        message="Êtes-vous sûr de vouloir supprimer cette zone ? Cette action est irréversible."
        confirmText="Supprimer"
        variant="danger"
        loading={deleteZone.isPending}
      />
    </div>
  );
}