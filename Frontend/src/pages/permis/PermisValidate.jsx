import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePermisDetail, useValiderPermis } from '../../hooks/usePermis';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Alert from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { ArrowLeft, CheckCircle, X, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAvailableActions, getValidationActionLabel, getNextStatusAfterValidation } from '../../utils/permissions';
import SignatureCanvas from 'react-signature-canvas';

export default function PermisValidate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [commentaire, setCommentaire] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [requiresSignature, setRequiresSignature] = useState(true);
  const [actionLabel, setActionLabel] = useState('Valider le permis');
  const [nextStatus, setNextStatus] = useState(null);
  const signatureRef = useRef(null);

  const { data, isLoading } = usePermisDetail(id);
  const validerPermis = useValiderPermis(id);

  const permis = data?.data;

  useEffect(() => {
    if (permis && user) {
      const actions = getAvailableActions(permis, user);
      const label = getValidationActionLabel(permis, user);
      const next = getNextStatusAfterValidation(permis, user);
      
      setActionLabel(label || 'Valider');
      setNextStatus(next);
      
      const isDemandeur = permis.demandeur_id === user.id;
      const isSubmitting = permis.statut === 'BROUILLON' && isDemandeur;
      
      setRequiresSignature(!isSubmitting);
    }
  }, [permis, user]);

  const handleClearSignature = () => {
    signatureRef.current?.clear();
    setHasSignature(false);
  };

  const handleValidate = async () => {
    if (!confirmed) {
      toast.error('Veuillez confirmer que vous avez vérifié toutes les informations');
      return;
    }

    if (requiresSignature && !hasSignature) {
      toast.error('Veuillez signer le permis avant de valider');
      return;
    }

    try {
      const signatureImage = hasSignature ? signatureRef.current?.toDataURL() : null;

      await validerPermis.mutateAsync({
        commentaire: commentaire.trim() || undefined,
        signature_image: signatureImage
      });

      toast.success(
        nextStatus === 'EN_ATTENTE' 
          ? 'Permis soumis pour validation avec succès' 
          : 'Permis validé avec succès'
      );
      navigate(`/permis/${id}`);
    } catch (error) {
      console.error('Erreur validation:', error);
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

  const actions = getAvailableActions(permis, user);
  if (!actions.canValidate) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Alert variant="warning">
              Vous n'avez pas les permissions nécessaires pour effectuer cette action sur ce permis.
              <div className="mt-2 text-sm">
                <strong>Statut actuel:</strong> {permis.statut}<br/>
                <strong>Votre rôle:</strong> {user.role}
              </div>
            </Alert>
            <Button onClick={() => navigate(`/permis/${id}`)} className="mt-4">
              Retour au permis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getConfirmationMessage = () => {
    const isDemandeur = permis.demandeur_id === user.id;
    
    if (permis.statut === 'BROUILLON' && isDemandeur) {
      return 'Je confirme que toutes les informations sont correctes et je souhaite soumettre ce permis pour validation.';
    }
    
    if (permis.statut === 'BROUILLON') {
      return 'Je confirme avoir vérifié toutes les informations et je valide ce permis.';
    }
    
    if (permis.statut === 'EN_ATTENTE') {
      return 'Je confirme avoir vérifié toutes les informations, les conditions de sécurité et les mesures de prévention. Je valide ce permis en connaissance de cause.';
    }
    
    if (permis.statut === 'VALIDE') {
      return 'Je confirme que toutes les conditions sont réunies et j\'autorise le démarrage des travaux.';
    }
    
    if (permis.statut === 'EN_COURS') {
      return 'Je confirme que les travaux sont terminés et je clôture ce permis.';
    }
    
    return 'Je confirme cette action.';
  };

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
              {actionLabel}
            </h1>
            <p className="text-base text-slate-600 mt-1">{permis.numero_permis}</p>
          </div>
        </div>

        {/* Info sur la transition */}
        {nextStatus && (
          <Alert variant="info">
            <strong>Action:</strong> Ce permis passera de <span className="font-semibold">{permis.statut}</span> à <span className="font-semibold">{nextStatus}</span>
          </Alert>
        )}

        {/* Résumé du permis */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Résumé du permis</h3>
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
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Statut actuel</dt>
              <dd className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  {permis.statut}
                </span>
              </dd>
            </div>
          </dl>

          {permis.description && (
            <div className="mt-6">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description</dt>
              <dd className="text-sm text-slate-900 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {permis.description}
              </dd>
            </div>
          )}
        </div>

        {/* Formulaire de validation */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">
            {requiresSignature ? "Validation et Signature" : "Validation"}
          </h3>
          <div className="space-y-6">
            {/* Commentaire */}
            <Textarea
              label={requiresSignature ? "Commentaire (optionnel)" : "Commentaire"}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              rows={4}
              placeholder="Ajoutez vos observations, remarques ou conditions spécifiques..."
              helperText="Ce commentaire sera visible dans l'historique du permis"
            />

            {/* Signature électronique */}
            {requiresSignature && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Signature électronique <span className="text-red-600">*</span>
                </label>
                <div className="border-2 border-slate-300 rounded-lg overflow-hidden bg-white">
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'w-full h-48',
                      style: { touchAction: 'none' }
                    }}
                    onEnd={() => setHasSignature(true)}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-slate-500">
                    Signez dans le cadre ci-dessus (souris ou tactile)
                  </p>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800 font-medium"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Effacer
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="confirm"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-1 mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="confirm" className="text-sm text-slate-700 cursor-pointer">
                  {getConfirmationMessage()}
                </label>
              </div>
            </div>

            {/* Alert info */}
            <Alert variant="info">
              {requiresSignature ? (
                <>
                  <strong>Information:</strong> Votre signature et cette validation seront enregistrées 
                  de manière immuable dans le système. Elles ne pourront pas être modifiées ultérieurement.
                </>
              ) : (
                <>
                  <strong>Information:</strong> Cette action sera enregistrée dans l'historique du permis.
                </>
              )}
            </Alert>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
          <Button
            variant="secondary"
            onClick={() => navigate(`/permis/${id}`)}
            disabled={validerPermis.isPending}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            icon={nextStatus === 'EN_ATTENTE' ? Send : CheckCircle}
            onClick={handleValidate}
            loading={validerPermis.isPending}
            disabled={!confirmed || (requiresSignature && !hasSignature)}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}