import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Edit,
  Save,
  Key,
  FileText,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import apiClient from '../api/client';

const profileSchema = yup.object({
  nom: yup.string().required('Le nom est requis'),
  prenom: yup.string().required('Le prénom est requis'),
  email: yup.string().email('Email invalide').required('L\'email est requis'),
});

const passwordSchema = yup.object({
  ancien_mot_de_passe: yup.string().required('L\'ancien mot de passe est requis'),
  nouveau_mot_de_passe: yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .matches(/[a-z]/, 'Doit contenir au moins une minuscule')
    .matches(/[0-9]/, 'Doit contenir au moins un chiffre')
    .required('Le nouveau mot de passe est requis'),
  confirmation_mot_de_passe: yup.string()
    .oneOf([yup.ref('nouveau_mot_de_passe')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation est requise'),
});

export const Profil: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
    }
  });

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  React.useEffect(() => {
    if (user) {
      reset({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmitProfile = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.put(`/utilisateurs/${user?.id}`, data);
      await refetchUser();
      toast.success('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: any) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        ancien_mot_de_passe: data.ancien_mot_de_passe,
        nouveau_mot_de_passe: data.nouveau_mot_de_passe,
      });
      toast.success('Mot de passe modifié avec succès');
      setShowPasswordModal(false);
      resetPassword();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <LoadingSpinner fullScreen />;

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      DEMANDEUR: 'bg-gray-100 text-gray-800',
      SUPERVISEUR: 'bg-blue-100 text-blue-800',
      RESP_ZONE: 'bg-purple-100 text-purple-800',
      HSE: 'bg-green-100 text-green-800',
      ADMIN: 'bg-red-100 text-red-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-2">Gérez vos informations personnelles</p>
      </div>

      {/* En-tête du profil */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.prenom?.[0]}{user.nom?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user.prenom} {user.nom}
              </h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Actif
                </span>
              </div>
            </div>
          </div>
          {!editMode && (
            <Button
              variant="secondary"
              icon={<Edit className="w-4 h-4" />}
              onClick={() => setEditMode(true)}
            >
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire d'informations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-6">Informations personnelles</h3>
        
        <form onSubmit={handleSubmit(onSubmitProfile)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <Controller
                  name="prenom"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={!editMode}
                      error={errors.prenom?.message}
                      icon={<User className="w-4 h-4 text-gray-400" />}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <Controller
                  name="nom"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      disabled={!editMode}
                      error={errors.nom?.message}
                      icon={<User className="w-4 h-4 text-gray-400" />}
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    disabled={!editMode}
                    error={errors.email?.message}
                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rôle
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{user.role}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membre depuis
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">
                  {format(new Date(user.date_creation), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>

          {editMode && (
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditMode(false);
                  reset();
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                icon={<Save className="w-4 h-4" />}
                loading={loading}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Sécurité</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Mot de passe</p>
            <p className="text-sm text-gray-600">Dernière modification il y a 30 jours</p>
          </div>
          <Button
            variant="secondary"
            icon={<Key className="w-4 h-4" />}
            onClick={() => setShowPasswordModal(true)}
          >
            Changer
          </Button>
        </div>
      </div>

      {/* Habilitations */}
      {user.habilitations && Object.keys(user.habilitations).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Habilitations</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(user.habilitations).map(([key, value]) => (
              <span
                key={key}
                className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Modal changement mot de passe */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          resetPassword();
        }}
        title="Changer le mot de passe"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ancien mot de passe *
            </label>
            <Controller
              name="ancien_mot_de_passe"
              control={passwordControl}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  error={passwordErrors.ancien_mot_de_passe?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe *
            </label>
            <Controller
              name="nouveau_mot_de_passe"
              control={passwordControl}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  error={passwordErrors.nouveau_mot_de_passe?.message}
                />
              )}
            />
            <p className="mt-1 text-xs text-gray-500">
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le nouveau mot de passe *
            </label>
            <Controller
              name="confirmation_mot_de_passe"
              control={passwordControl}
              render={({ field }) => (
                <Input
                  {...field}
                  type="password"
                  error={passwordErrors.confirmation_mot_de_passe?.message}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPasswordModal(false);
                resetPassword();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              icon={<Save className="w-4 h-4" />}
              loading={loading}
            >
              Changer le mot de passe
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};