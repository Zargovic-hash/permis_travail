import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save, AlertTriangle } from 'lucide-react';
import { usePermisDetail, useUpdatePermis } from '../hooks/usePermis';
import { useZones } from '../hooks/useZones';
import { useTypesPermis } from '../hooks/useTypesPermis';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { toast } from 'react-toastify';

const schema = yup.object({
  type_permis_id: yup.string().required('Le type de permis est requis'),
  zone_id: yup.string().required('La zone est requise'),
  titre: yup.string().min(5, 'Le titre doit contenir au moins 5 caractères').required('Le titre est requis'),
  description: yup.string().required('La description est requise'),
  date_debut: yup.string().required('La date de début est requise'),
  date_fin: yup.string().required('La date de fin est requise'),
});

export const PermisEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { data, isLoading } = usePermisDetail(id!);
  const { data: zones } = useZones();
  const { data: types } = useTypesPermis();
  const updateMutation = useUpdatePermis(id!);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (data?.permis) {
      const permis = data.permis;
      reset({
        type_permis_id: permis.type_permis_id,
        zone_id: permis.zone_id,
        titre: permis.titre,
        description: permis.description,
        date_debut: new Date(permis.date_debut).toISOString().slice(0, 16),
        date_fin: new Date(permis.date_fin).toISOString().slice(0, 16),
      });
    }
  }, [data, reset]);

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (!data) return <div>Permis non trouvé</div>;

  const permis = data.permis;
  const canEdit = (
    (permis.statut === 'BROUILLON' || permis.statut === 'EN_ATTENTE') && 
    permis.demandeur_id === user?.id
  ) || hasRole('HSE', 'ADMIN');

  if (!canEdit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Modification non autorisée
            </h3>
            <p className="text-red-700">
              Ce permis ne peut plus être modifié. Statut actuel: {permis.statut}
            </p>
            <Button
              variant="secondary"
              onClick={() => navigate(`/permis/${id}`)}
              className="mt-4"
            >
              Retour aux détails
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (formData: any) => {
    try {
      await updateMutation.mutateAsync(formData);
      toast.success('Permis modifié avec succès');
      navigate(`/permis/${id}`);
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Modifier le Permis
        </h1>
        <p className="text-gray-600">{permis.numero_permis}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de permis *
            </label>
            <Controller
              name="type_permis_id"
              control={control}
              render={({ field }) => (
                <Select {...field} error={errors.type_permis_id?.message}>
                  <option value="">Sélectionnez un type</option>
                  {types?.types_permis?.map((type: any) => (
                    <option key={type.id} value={type.id}>{type.nom}</option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone *
            </label>
            <Controller
              name="zone_id"
              control={control}
              render={({ field }) => (
                <Select {...field} error={errors.zone_id?.message}>
                  <option value="">Sélectionnez une zone</option>
                  {zones?.zones?.map((zone: any) => (
                    <option key={zone.id} value={zone.id}>{zone.nom}</option>
                  ))}
                </Select>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre *
            </label>
            <Controller
              name="titre"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  error={errors.titre?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              )}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <Controller
                name="date_debut"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    error={errors.date_debut?.message}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin *
              </label>
              <Controller
                name="date_fin"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="datetime-local"
                    error={errors.date_fin?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/permis/${id}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              icon={<Save className="w-4 h-4" />}
              loading={updateMutation.isPending}
            >
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};