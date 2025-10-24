import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateUtilisateur } from '../hooks/useUtilisateurs';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Tabs from '../components/ui/Tabs';
import Modal from '../components/ui/Modal';


import { User, Mail, Phone, Shield, Calendar, Edit, Save } from 'lucide-react';
import { getRoleLabel, getRoleBadgeColor, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, refetchUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    telephone: user?.telephone || ''
  });

  const updateUser = useUpdateUtilisateur(user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await updateUser.mutateAsync(formData);
      setIsEditing(false);
      refetchUser();
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: user?.nom || '',
      prenom: user?.prenom || '',
      email: user?.email || '',
      telephone: user?.telephone || ''
    });
    setIsEditing(false);
  };

  const tabs = [
    {
      label: 'Informations',
      icon: User,
      content: (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Informations personnelles</h3>
            {!isEditing && (
              <Button
                variant="secondary"
                icon={Edit}
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Modifier
              </Button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nom"
                icon={User}
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                disabled={!isEditing}
                required
              />

              <Input
                label="Prénom"
                icon={User}
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                disabled={!isEditing}
                required
              />

              <Input
                label="Email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                required
              />

              <Input
                label="Téléphone"
                type="tel"
                icon={Phone}
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                disabled={!isEditing}
                placeholder="Ex: +33 6 12 34 56 78"
              />
            </div>

            {isEditing &&(
<div className="flex justify-end space-x-3">
<Button
               type="button"
               variant="secondary"
               onClick={handleCancel}
             >
Annuler
</Button>
<Button
               type="submit"
               variant="primary"
               icon={Save}
               loading={updateUser.isPending}
             >
Enregistrer
</Button>
</div>
)}
</form>
</div>
)
},
{
label: 'Sécurité',
icon: Shield,
content: (
<div className="space-y-6">
<h3 className="text-lg font-semibold text-gray-900">Sécurité du compte</h3>      <Card>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Mot de passe</label>
            <p className="text-sm text-gray-500 mt-1">••••••••</p>
          </div>
          <Button variant="secondary" size="sm">
            Changer le mot de passe
          </Button>
        </div>
      </Card>      <Card>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Authentification à deux facteurs</label>
            <p className="text-sm text-gray-500 mt-1">
              Ajoutez une couche de sécurité supplémentaire à votre compte
            </p>
          </div>
          <Button variant="secondary" size="sm" disabled>
            Activer (Bientôt disponible)
          </Button>
        </div>
      </Card>
    </div>
  )
}
];return (
<div className="max-w-4xl mx-auto space-y-6">
{/* Header */}
<div>
<h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
<p className="mt-2 text-sm text-gray-700">
Gérez vos informations personnelles et paramètres de sécurité
</p>
</div>  {/* Profile Card */}
  <Card>
    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
      <Avatar
        name={`${user?.prenom} ${user?.nom}`}
        size="2xl"
      />
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900">
          {user?.prenom} {user?.nom}
        </h2>
        <p className="text-gray-500 mt-1">{user?.email}</p>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user?.role)}`}>
            <Shield className="w-4 h-4 mr-1" />
            {getRoleLabel(user?.role)}
          </span>
          <Badge variant={user?.actif ? 'success' : 'danger'}>
            {user?.actif ? 'Compte actif' : 'Compte inactif'}
          </Badge>
        </div>
        <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mt-3">
          <Calendar className="w-4 h-4 mr-1" />
          Membre depuis {formatDate(user?.date_creation, 'date')}
        </div>
      </div>
    </div>
  </Card>  {/* Tabs */}
  <Tabs tabs={tabs} />
</div>
);
}