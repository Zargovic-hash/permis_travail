import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Switch from '../components/ui/Switch';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';
import { Bell, Moon, Globe, Database, Download } from 'lucide-react';
import { toast } from 'react-toastify';export default function Settings() {
const [settings, setSettings] = useState({
notifications: {
email: true,
push: false,
permisValidated: true,
permisExpiring: true,
permisRejected: true
},
appearance: {
theme: 'light',
language: 'fr'
},
data: {
autoBackup: false,
retention: '365'
}
});const handleSave = () => {
// Sauvegarder dans localStorage
localStorage.setItem('settings', JSON.stringify(settings));
toast.success('Paramètres enregistrés');
};const handleExportData = () => {
toast.info('Export des données en cours...');
// Logique d'export
};return (
<div className="max-w-4xl mx-auto space-y-6">
{/* Header */}
<div>
<h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
<p className="mt-2 text-sm text-gray-700">
Personnalisez votre expérience et gérez vos préférences
</p>
</div>  {/* Notifications */}
  <Card title="Notifications" headerActions={<Bell className="w-5 h-5 text-gray-400" />}>
    <div className="space-y-4">
      <Switch
        label="Notifications par email"
        checked={settings.notifications.email}
        onChange={(checked) => setSettings({
          ...settings,
          notifications: { ...settings.notifications, email: checked }
        })}
      />      <Switch
        label="Notifications push (navigateur)"
        checked={settings.notifications.push}
        onChange={(checked) => setSettings({
          ...settings,
          notifications: { ...settings.notifications, push: checked }
        })}
      />      <div className="border-t border-gray-200 pt-4 mt-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Me notifier pour :
        </p>        <div className="space-y-3 ml-4">
          <Switch
            label="Permis validé"
            checked={settings.notifications.permisValidated}
            onChange={(checked) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, permisValidated: checked }
            })}
          />          <Switch
            label="Permis expirant bientôt"
            checked={settings.notifications.permisExpiring}
            onChange={(checked) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, permisExpiring: checked }
            })}
          />          <Switch
            label="Permis refusé"
            checked={settings.notifications.permisRejected}
            onChange={(checked) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, permisRejected: checked }
            })}
          />
        </div>
      </div>
    </div>
  </Card>  {/* Apparence */}
  <Card title="Apparence" headerActions={<Moon className="w-5 h-5 text-gray-400" />}>
    <div className="space-y-4">
      <Select
        label="Thème"
        value={settings.appearance.theme}
        onChange={(e) => setSettings({
          ...settings,
          appearance: { ...settings.appearance, theme: e.target.value }
        })}
        options={[
          { value: 'light', label: 'Clair' },
          { value: 'dark', label: 'Sombre (bientôt disponible)', disabled: true },
          { value: 'auto', label: 'Automatique (bientôt disponible)', disabled: true }
        ]}
      />      <Select
        label="Langue"
        value={settings.appearance.language}
        onChange={(e) => setSettings({
          ...settings,
          appearance: { ...settings.appearance, language: e.target.value }
        })}
        options={[
          { value: 'fr', label: 'Français' },
          { value: 'en', label: 'English (bientôt disponible)', disabled: true }
        ]}
      />
    </div>
  </Card>  {/* Données */}
  <Card title="Gestion des données" headerActions={<Database className="w-5 h-5 text-gray-400" />}>
    <div className="space-y-4">
      <Switch
        label="Sauvegarde automatique"
        checked={settings.data.autoBackup}
        onChange={(checked) => setSettings({
          ...settings,
          data: { ...settings.data, autoBackup: checked }
        })}
      />      <Select
        label="Durée de rétention des logs"
        value={settings.data.retention}
        onChange={(e) => setSettings({
          ...settings,
          data: { ...settings.data, retention: e.target.value }
        })}
        options={[
          { value: '90', label: '3 mois' },
          { value: '180', label: '6 mois' },
          { value: '365', label: '1 an' },
          { value: '730', label: '2 ans' }
        ]}
        helperText="Les logs d'audit sont conservés pendant cette période"
      />      <div className="border-t border-gray-200 pt-4 mt-4">
        <Button
          variant="secondary"
          icon={Download}
          onClick={handleExportData}
        >
          Exporter mes données (RGPD)
        </Button>
        <p className="text-xs text-gray-500 mt-2">
          Téléchargez une copie de toutes vos données personnelles
        </p>
      </div>
    </div>
  </Card>  {/* Zone dangereuse */}
  <Card title="Zone dangereuse">
    <Alert variant="warning">
      Les actions suivantes sont irréversibles. Procédez avec précaution.
    </Alert>    <div className="mt-4 space-y-3">
      <Button variant="danger" size="sm" disabled>
        Supprimer mon compte
      </Button>
      <p className="text-xs text-gray-500">
        Cette action supprimera définitivement votre compte et toutes vos données.
      </p>
    </div>
  </Card>  {/* Save Button */}
  <div className="flex justify-end">
    <Button variant="primary" onClick={handleSave}>
      Enregistrer les paramètres
    </Button>
  </div>
</div>
);
}