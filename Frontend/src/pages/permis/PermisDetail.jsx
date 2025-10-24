import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  usePermisDetail, 
  useSuspendPermis, 
  useClosePermis,
  useExportPermisPDF,
  useVerifyPermisPDF
} from '../../hooks/usePermis';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import Tabs from '../../components/ui/Tabs';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Textarea from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  ArrowLeft,
  Edit,
  Download,
  Shield,
  XCircle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  File,
  PlayCircle
} from 'lucide-react';
import { formatDate, getInitials } from '../../utils/formatters';
import { 
  getAvailableActions,
  getValidationActionLabel,
  getWorkflowDescription
} from '../../utils/permissions';
import { toast } from 'react-toastify';

export default function PermisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, refetch } = usePermisDetail(id);
  const suspendPermis = useSuspendPermis(id);
  const closePermis = useClosePermis(id);
  const exportPDF = useExportPermisPDF();
  const verifyPDF = useVerifyPermisPDF();

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  const permis = data?.data;

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      toast.error('Veuillez indiquer la raison de la suspension');
      return;
    }
    try {
      await suspendPermis.mutateAsync({ raison: suspendReason });
      setShowSuspendModal(false);
      setSuspendReason('');
      refetch();
    } catch (error) {
      console.error('Erreur suspension:', error);
    }
  };

  const handleClose = async () => {
    try {
      await closePermis.mutateAsync();
      setShowCloseDialog(false);
      refetch();
    } catch (error) {
      console.error('Erreur clôture:', error);
    }
  };

  const handleExportPDF = async () => {
    await exportPDF.mutateAsync(id);
  };

  const handleVerifyPDF = async () => {
    await verifyPDF.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Skeleton height="80px" />
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  if (!permis) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  const actions = getAvailableActions(permis, user);
  const validationLabel = getValidationActionLabel(permis, user);
  const workflowDescription = getWorkflowDescription(permis, user);

  const tabs = [
    {
      label: 'Informations',
      icon: FileText,
      content: <TabInformations permis={permis} />
    },
    {
      label: 'Approbations',
      icon: CheckCircle2,
      badge: permis.approbations?.length || 0,
      content: <TabApprobations permis={permis} user={user} onRefetch={refetch} />
    },
    {
      label: 'Historique',
      icon: Clock,
      content: <TabHistorique permis={permis} />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => navigate('/permis')}
              className="mt-1 p-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {permis.numero_permis}
              </h1>
              <p className="text-base text-slate-600 mt-1">{permis.titre}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {actions.canEdit && (
              <Button
                variant="secondary"
                icon={Edit}
                onClick={() => navigate(`/permis/${id}/modifier`)}
              >
                Modifier
              </Button>
            )}

            {actions.canValidate && (
              <Button
                variant="primary"
                icon={actions.nextStatus === 'EN_ATTENTE' ? CheckCircle : PlayCircle}
                onClick={() => navigate(`/permis/${id}/valider`)}
              >
                {validationLabel}
              </Button>
            )}

            {actions.canReactivate && (
              <Button
                variant="success"
                icon={PlayCircle}
                onClick={() => navigate(`/permis/${id}/reactiver`)}
              >
                Réactiver
              </Button>
            )}

            {actions.canSuspend && (
              <Button
                variant="warning"
                icon={AlertTriangle}
                onClick={() => setShowSuspendModal(true)}
              >
                Suspendre
              </Button>
            )}

            {actions.canClose && !actions.canValidate && (
              <Button
                variant="secondary"
                icon={XCircle}
                onClick={() => setShowCloseDialog(true)}
              >
                Clôturer
              </Button>
            )}

            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportPDF}
              loading={exportPDF.isPending}
            >
              Export PDF
            </Button>

            <Button
              variant="ghost"
              icon={Shield}
              onClick={handleVerifyPDF}
              loading={verifyPDF.isPending}
            >
              Vérifier PDF
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center flex-wrap gap-4">
              <StatusBadge status={permis.statut} />
              <div className="h-6 w-px bg-slate-300 hidden sm:block" />
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-1.5" />
                {permis.zone_nom}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <User className="w-4 h-4 mr-1.5" />
                {permis.demandeur_prenom} {permis.demandeur_nom}
              </div>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Calendar className="w-4 h-4 mr-1.5" />
              {formatDate(permis.date_debut, 'date')} - {formatDate(permis.date_fin, 'date')}
            </div>
          </div>
        </div>

        {/* Workflow Description */}
        {workflowDescription && (
          <Alert variant="info">
            {workflowDescription}
          </Alert>
        )}

        {/* Alerts */}
        {permis.statut === 'SUSPENDU' && (
          <Alert variant="danger">
            <strong>Permis suspendu</strong> - Les travaux doivent être arrêtés immédiatement.
          </Alert>
        )}

        {permis.statut === 'CLOTURE' && (
          <Alert variant="info">
            Ce permis est clôturé. Aucune modification n'est possible.
          </Alert>
        )}

        {/* Tabs */}
        <Tabs tabs={tabs} defaultTab={0} />

        {/* Suspend Modal */}
        <Modal
          isOpen={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          title="Suspendre le permis"
          footer={
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowSuspendModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleSuspend}
                loading={suspendPermis.isPending}
              >
                Suspendre
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Alert variant="warning">
              La suspension d'un permis entraîne l'arrêt immédiat des travaux. Cette action sera enregistrée dans l'historique.
            </Alert>

            <Textarea
              label="Raison de la suspension"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              rows={4}
              required
              placeholder="Indiquez la raison de la suspension..."
            />
          </div>
        </Modal>

        {/* Close Confirmation */}
        <ConfirmDialog
          isOpen={showCloseDialog}
          onClose={() => setShowCloseDialog(false)}
          onConfirm={handleClose}
          title="Clôturer le permis"
          message="Êtes-vous sûr de vouloir clôturer ce permis ? Les travaux seront considérés comme terminés."
          confirmText="Clôturer"
          variant="primary"
          loading={closePermis.isPending}
        />
      </div>
    </div>
  );
}

// Tab: Informations
function TabInformations({ permis }) {
  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Informations générales</h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Numéro</dt>
            <dd className="mt-1 text-sm text-slate-900 font-semibold">{permis.numero_permis}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Titre</dt>
            <dd className="mt-1 text-sm text-slate-900">{permis.titre}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Zone</dt>
            <dd className="mt-1 text-sm text-slate-900">{permis.zone_nom}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type</dt>
            <dd className="mt-1 text-sm text-slate-900">{permis.type_permis_nom}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Demandeur</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {permis.demandeur_prenom} {permis.demandeur_nom}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</dt>
            <dd className="mt-1">
              <StatusBadge status={permis.statut} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date de début</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(permis.date_debut, 'full')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date de fin</dt>
            <dd className="mt-1 text-sm text-slate-900">
              {formatDate(permis.date_fin, 'full')}
            </dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description</dt>
            <dd className="text-sm text-slate-900 bg-slate-50 p-4 rounded-lg">
              {permis.description || 'Aucune description'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Conditions préalables */}
      {permis.conditions_prealables && Object.keys(permis.conditions_prealables).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Conditions préalables</h3>
          <div className="space-y-3">
            {Object.entries(permis.conditions_prealables).map(([key, value], index) => (
              <div key={index} className="flex items-start p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{key}</div>
                  <div className="text-sm text-slate-600 mt-1">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mesures de prévention */}
      {permis.mesures_prevention && Object.keys(permis.mesures_prevention).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Mesures de prévention</h3>
          <div className="space-y-3">
            {Object.entries(permis.mesures_prevention).map(([key, value], index) => (
              <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-slate-900">{key}</div>
                  <div className="text-sm text-slate-600 mt-1">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tests atmosphériques */}
      {permis.resultat_tests_atmos && Object.keys(permis.resultat_tests_atmos).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tests atmosphériques</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(permis.resultat_tests_atmos).map(([key, value], index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{key}</div>
                <div className="text-xl font-bold text-slate-900 mt-2">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Justificatifs */}
      {permis.justificatifs && Object.keys(permis.justificatifs).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Justificatifs</h3>
          <div className="space-y-2">
            {Object.entries(permis.justificatifs).map(([filename, filepath], index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-slate-400" />
                  <span className="text-sm text-slate-900 font-medium">{filename}</span>
                </div>
                <button
                  onClick={() => window.open(filepath, '_blank')}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Tab: Approbations
function TabApprobations({ permis, user, onRefetch }) {
  const navigate = useNavigate();
  const actions = getAvailableActions(permis, user);
  const validationLabel = getValidationActionLabel(permis, user);

  const approbations = permis.approbations || [];

  return (
    <div className="space-y-6">
      {approbations.length === 0 ? (
        <Alert variant="info">
          Aucune approbation pour ce permis.
        </Alert>
      ) : (
        <div className="space-y-4">
          {approbations.map((approbation) => (
            <div key={approbation.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {getInitials(approbation.prenom, approbation.nom)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {approbation.prenom} {approbation.nom}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {approbation.role_app} • {formatDate(approbation.date_action, 'relative')}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        approbation.statut === 'APPROUVE' ? 'success' :
                        approbation.statut === 'REFUSE' ? 'danger' : 'warning'
                      }
                    >
                      {approbation.statut}
                    </Badge>
                  </div>

                  {approbation.commentaire && (
                    <p className="mt-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                      {approbation.commentaire}
                    </p>
                  )}

                  {approbation.signature_image_path && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-500 mb-2 font-medium">Signature électronique :</p>
                      <img 
                        src={approbation.signature_image_path} 
                        alt="Signature" 
                        className="h-16 border border-slate-200 rounded bg-white p-2"
                      />
                    </div>
                  )}

                  {approbation.signature_hash && (
                    <div className="mt-3 flex items-center text-xs text-slate-500">
                      <Shield className="w-3 h-3 mr-1" />
                      Hash: {approbation.signature_hash.substring(0, 16)}...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action button if user can validate */}
      {actions.canValidate && (
        <Button
          variant="primary"
          icon={CheckCircle}
          onClick={() => navigate(`/permis/${permis.id}/valider`)}
          fullWidth
        >
          {validationLabel}
        </Button>
      )}
    </div>
  );
}

// Tab: Historique
function TabHistorique({ permis }) {
  const events = [];

  events.push({
    type: 'creation',
    date: permis.date_creation,
    title: 'Permis créé',
    description: `Par ${permis.demandeur_prenom} ${permis.demandeur_nom}`
  });

  if (permis.date_modification !== permis.date_creation) {
    events.push({
      type: 'modification',
      date: permis.date_modification,
      title: 'Permis modifié',
      description: 'Dernière modification'
    });
  }

  if (permis.approbations) {
    permis.approbations.forEach(app => {
      events.push({
        type: app.statut.toLowerCase(),
        date: app.date_action,
        title: `${app.statut} par ${app.prenom} ${app.nom}`,
        description: app.commentaire || `Validation ${app.role_app}`
      });
    });
  }

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const getEventIcon = (type) => {
    switch (type) {
      case 'creation': return <FileText className="w-5 h-5" />;
      case 'modification': return <Edit className="w-5 h-5" />;
      case 'approuve': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'refuse': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'suspendu': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="flex-shrink-0 mt-1">
            {getEventIcon(event.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">{event.title}</p>
            <p className="text-sm text-slate-600 mt-1">{event.description}</p>
            <p className="text-xs text-slate-500 mt-2">
              {formatDate(event.date, 'full')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}