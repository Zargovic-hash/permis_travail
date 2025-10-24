import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { usePermisDetail, useUpdatePermis } from '../../hooks/usePermis';
import { useZones } from '../../hooks/useZones';
import { useTypesPermis } from '../../hooks/useTypesPermis';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import { canEditPermis } from '../../utils/permissions';
import { formatDate } from '../../utils/formatters';

const schema = yup.object({
  type_permis_id: yup.string().required('Le type de permis est requis'),
  zone_id: yup.string().required('La zone est requise'),
  titre: yup.string().min(5, 'Le titre doit contenir au moins 5 caractères').required('Le titre est requis'),
  description: yup.string(),
  date_debut: yup.date().required('La date de début est requise'),
  date_fin: yup.date()
    .required('La date de fin est requise')
    .min(yup.ref('date_debut'), 'La date de fin doit être après la date de début')
});

export default function PermisEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading } = usePermisDetail(id);
  const { data: zones } = useZones();
  const { data: types } = useTypesPermis();
  const updatePermis = useUpdatePermis(id);

  const permis = data?.data;

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (permis) {
      if (!canEditPermis(permis, user)) {
        toast.error('Vous n\'avez pas les droits pour modifier ce permis');
        navigate(`/permis/${id}`);
        return;
      }

      reset({
        type_permis_id: permis.type_permis_id,
        zone_id: permis.zone_id,
        titre: permis.titre,
        description: permis.description || '',
        date_debut: formatDate(permis.date_debut, 'datetime-local'),
        date_fin: formatDate(permis.date_fin, 'datetime-local')
      });
    }
  }, [permis, user, navigate, id, reset]);

  const onSubmit = async (data) => {
    try {
      await updatePermis.mutateAsync(data);
      navigate(`/permis/${id}`);
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton height="80px" />
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  if (!permis) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Alert variant="danger">
              Permis non trouvé
            </Alert>
            <Button onClick={() => navigate('/permis')} className="mt-4">
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate(`/permis/${id}`)}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Modifier le permis
            </h1>
            <p className="text-base text-slate-600 mt-1">{permis.numero_permis}</p>
          </div>
        </div>

        {/* Alert */}
        {permis.statut !== 'BROUILLON' && permis.statut !== 'EN_ATTENTE' && (
          <Alert variant="warning">
            Ce permis n'est plus en brouillon. Certaines modifications peuvent nécessiter une nouvelle validation.
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Type de permis"
                  {...register('type_permis_id')}
                  error={errors.type_permis_id?.message}
                  required
                  options={[
                    { value: '', label: 'Sélectionner un type', disabled: true },
                    ...(types?.data || []).map(t => ({ value: t.id, label: t.nom }))
                  ]}
                />

                <Select
                  label="Zone"
                  {...register('zone_id')}
                  error={errors.zone_id?.message}
                  required
                  options={[
                    { value: '', label: 'Sélectionner une zone', disabled: true },
                    ...(zones?.data || []).map(z => ({ value: z.id, label: z.nom }))
                  ]}
                />
              </div>

              <Input
                label="Titre du permis"
                {...register('titre')}
                error={errors.titre?.message}
                required
              />

              <Textarea
                label="Description détaillée"
                {...register('description')}
                error={errors.description?.message}
                rows={4}
                maxLength={1000}
                showCount
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  type="datetime-local"
                  label="Date et heure de début"
                  {...register('date_debut')}
                  error={errors.date_debut?.message}
                  required
                />

                <Input
                  type="datetime-local"
                  label="Date et heure de fin"
                  {...register('date_fin')}
                  error={errors.date_fin?.message}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/permis/${id}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={updatePermis.isPending}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}