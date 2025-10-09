import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { SignatureCanvas } from './SignatureCanvas';
import { useValiderPermis } from '../../hooks/usePermis';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ValidationFormProps {
  permisId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  allowRefuse?: boolean;
}

export const ValidationForm: React.FC<ValidationFormProps> = ({
  permisId,
  onSuccess,
  onCancel,
  allowRefuse = false
}) => {
  const [commentaire, setCommentaire] = useState('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [action, setAction] = useState<'approve' | 'refuse'>('approve');

  const { mutate: valider, isPending } = useValiderPermis(permisId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentaire.trim()) {
      alert('Le commentaire est requis');
      return;
    }

    const validationData: any = {
      commentaire: commentaire.trim(),
      action: action
    };

    if (signatureData) {
      // Convertir base64 en File
      fetch(signatureData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'signature.png', { type: 'image/png' });
          validationData.signature_image = file;

          valider(validationData, {
            onSuccess: () => {
              onSuccess?.();
            }
          });
        });
    } else {
      valider(validationData, {
        onSuccess: () => {
          onSuccess?.();
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Type d'action */}
      {allowRefuse && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="action"
              value="approve"
              checked={action === 'approve'}
              onChange={(e) => setAction(e.target.value as 'approve')}
              className="mr-2"
            />
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="font-medium">Approuver</span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="action"
              value="refuse"
              checked={action === 'refuse'}
              onChange={(e) => setAction(e.target.value as 'refuse')}
              className="mr-2"
            />
            <XCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-medium">Refuser</span>
          </label>
        </div>
      )}

      {/* Commentaire */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire <span className="text-red-500">*</span>
        </label>
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          rows={4}
          placeholder={action === 'approve' 
            ? "Entrez vos observations et validations..."
            : "Expliquez les raisons du refus..."}
          className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="mt-1 text-sm text-gray-500">
          Décrivez les vérifications effectuées et vos conclusions
        </p>
      </div>

      {/* Signature électronique */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Signature électronique (optionnel)
          </label>
          <button
            type="button"
            onClick={() => setShowSignature(!showSignature)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showSignature ? 'Masquer' : 'Afficher'} la signature
          </button>
        </div>

        {showSignature && (
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <SignatureCanvas
              onSave={(data) => setSignatureData(data)}
              onClear={() => setSignatureData(null)}
            />
          </div>
        )}
      </div>

      {/* Confirmation */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="confirm"
          required
          className="mt-1 mr-2"
        />
        <label htmlFor="confirm" className="text-sm text-gray-700">
          Je confirme avoir vérifié toutes les informations du permis et les mesures de sécurité associées.
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Annuler
          </button>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
            action === 'approve'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isPending ? (
            <>
              <LoadingSpinner size="sm" />
              Traitement...
            </>
          ) : (
            <>
              {action === 'approve' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {action === 'approve' ? 'Approuver le permis' : 'Refuser le permis'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};