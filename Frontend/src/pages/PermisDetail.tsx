import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Download,
  Edit,
  Ban,
  CheckSquare,
  Upload
} from 'lucide-react';
import { usePermisDetail, useValiderPermis, useSuspendrePermis, useCloturerPermis } from '../hooks/usePermis';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/permis/StatusBadge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const PermisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { data, isLoading, error } = usePermisDetail(id!);
  const validerMutation = useValiderPermis(id!);
  const suspendreMutation = useSuspendrePermis(id!);
  const cloturerMutation = useCloturerPermis(id!);

  const [activeTab, setActiveTab] = useState<'infos' | 'approbations' | 'historique'>('infos');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [validationComment, setValidationComment] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');

  if (isLoading) return <LoadingSpinner fullScreen />;
  if (error) return <div className="text-red-600">Erreur de chargement</div>;
  if (!data) return <div>Permis non trouvé</div>;

  const permis = data.permis;
  const canEdit = permis.statut === 'BROUILLON' && permis.demandeur_id === user?.id;
  const canValidate = (
    (permis.statut === 'EN_ATTENTE' && hasRole('SUPERVISEUR', 'HSE', 'ADMIN')) ||
    (permis.statut === 'VALIDE' && hasRole('RESP_ZONE', 'HSE', 'ADMIN'))
  );
  const canSuspend = hasRole('HSE', 'RESP_ZONE', 'ADMIN') && 
    ['EN_COURS', 'VALIDE'].includes(permis.statut);
  const canClose = (permis.demandeur_id === user?.id || hasRole('HSE', 'SUPERVISEUR', 'ADMIN')) &&
    permis.statut === 'EN_COURS';

  const handleValidation = async () => {
    try {
      await validerMutation.mutateAsync({ commentaire: validationComment });
      setShowValidationModal(false);
      setValidationComment('');
      toast.success('Permis validé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleSuspension = async () => {
    try {
      await suspendreMutation.mutateAsync({ raison: suspensionReason });
      setShowSuspensionModal(false);
      setSuspensionReason('');
      toast.success('Permis suspendu');
    } catch (error) {
      toast.error('Erreur lors de la suspension');
    }
  };

  const handleCloture = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir clôturer ce permis ?')) return;
    try {
      await cloturerMutation.mutateAsync({});
      toast.success('Permis clôturé');
    } catch (error) {
      toast.error('Erreur lors de la clôture');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/permis/${id}/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permis-${permis.numero_permis}.pdf`;
      a.click();
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {permis.numero_permis}
            </h1>
            <p className="text-gray-600 text-lg mb-4">{permis.titre}</p>
            <StatusBadge status={permis.statut} />
          </div>
          
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="secondary"
                icon={<Edit className="w-4 h-4" />}
                onClick={() => navigate(`/permis/${id}/modifier`)}
              >
                Modifier
              </Button>
            )}
            {canValidate && (
              <Button
                variant="success"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={() => setShowValidationModal(true)}
              >
                Valider
              </Button>
            )}
            {canSuspend && (
              <Button
                variant="danger"
                icon={<Ban className="w-4 h-4" />}
                onClick={() => setShowSuspensionModal(true)}
              >
                Suspendre
              </Button>
            )}
            {canClose && (
              <Button
                variant="secondary"
                icon={<CheckSquare className="w-4 h-4" />}
                onClick={handleCloture}
              >
                Clôturer
              </Button>
            )}
            <Button
              variant="ghost"
              icon={<Download className="w-4 h-4" />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Informations rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium">{permis.type_permis_nom}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Zone</p>
              <p className="font-medium">{permis.zone_nom}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Demandeur</p>
              <p className="font-medium">{permis.demandeur_nom} {permis.demandeur_prenom}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Période</p>
              <p className="font-medium text-sm">
                {format(new Date(permis.date_debut), 'dd/MM/yyyy', { locale: fr })} - 
                {format(new Date(permis.date_fin), 'dd/MM/yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['infos', 'approbations', 'historique'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab === 'infos' && 'Informations'}
                {tab === 'approbations' && 'Approbations'}
                {tab === 'historique' && 'Historique'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'infos' && (
          <div className="space-y-8">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{permis.description}</p>
            </div>

            {/* Conditions préalables */}
            {permis.conditions_prealables && Object.keys(permis.conditions_prealables).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Conditions préalables</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(permis.conditions_prealables).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600">{key}</dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Mesures de prévention */}
            {permis.mesures_prevention && Object.keys(permis.mesures_prevention).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Mesures de prévention</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="space-y-2">
                    {Object.entries(permis.mesures_prevention).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="text-gray-600">{key}</dt>
                        <dd className="font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Tests atmosphériques */}
            {permis.resultat_tests_atmos && Object.keys(permis.resultat_tests_atmos).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Tests atmosphériques</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-2 gap-4">
                    {Object.entries(permis.resultat_tests_atmos).map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-gray-600 text-sm">{key}</dt>
                        <dd className="font-medium text-lg">{String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Justificatifs */}
            {permis.justificatifs && Object.keys(permis.justificatifs).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Justificatifs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(permis.justificatifs).map(([filename, url]) => (
                    <a
                      key={filename}
                      href={`${process.env.REACT_APP_UPLOAD_URL}/${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <FileText className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm truncate">{filename}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approbations' && (
          <div className="space-y-6">
            {permis.approbations && permis.approbations.length > 0 ? (
              <div className="relative">
                <div className="absolute left-6 top-0 h-full w-0.5 bg-gray-200" />
                {permis.approbations.map((app: any, index: number) => (
                  <div key={app.id} className="relative flex gap-4 pb-8">
                    <div className={`
                      relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                      ${app.statut === 'APPROUVE' ? 'bg-green-100' : 'bg-red-100'}
                    `}>
                      {app.statut === 'APPROUVE' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{app.nom} {app.prenom}</p>
                          <p className="text-sm text-gray-600">{app.role_app}</p>
                        </div>
                        <span className={`
                          px-3 py-1 rounded-full text-sm font-medium
                          ${app.statut === 'APPROUVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {app.statut}
                        </span>
                      </div>
                      {app.commentaire && (
                        <p className="text-gray-700 mb-2">{app.commentaire}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(app.date_action), 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                        {app.signature_hash && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Signature vérifiée
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune approbation pour le moment</p>
            )}
          </div>
        )}

        {activeTab === 'historique' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Créé le {format(new Date(permis.date_creation), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
            </div>
            {permis.date_modification !== permis.date_creation && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Modifié le {format(new Date(permis.date_modification), 'dd/MM/yyyy HH:mm', { locale: fr })}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de validation */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Valider le permis"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire
            </label>
            <textarea
              value={validationComment}
              onChange={(e) => setValidationComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Ajoutez un commentaire (optionnel)..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowValidationModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={handleValidation}
              loading={validerMutation.isPending}
            >
              Valider le permis
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de suspension */}
      <Modal
        isOpen={showSuspensionModal}
        onClose={() => setShowSuspensionModal(false)}
        title="Suspendre le permis"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              La suspension du permis arrêtera immédiatement tous les travaux associés.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison de la suspension *
            </label>
            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Indiquez la raison de la suspension..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowSuspensionModal(false)}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleSuspension}
              loading={suspendreMutation.isPending}
              disabled={!suspensionReason.trim()}
            >
              Suspendre
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};