import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Upload,
  Signature
} from 'lucide-react';
import { Permis } from '@/types';
import { toast } from 'sonner';

interface ValidationDialogProps {
  permis: Permis | null;
  isOpen: boolean;
  onClose: () => void;
  onValidate: (permisId: string, commentaire: string, signature?: string) => Promise<void>;
  userRole?: string;
}

export const ValidationDialog: React.FC<ValidationDialogProps> = ({
  permis,
  isOpen,
  onClose,
  onValidate,
  userRole
}) => {
  const [commentaire, setCommentaire] = useState('');
  const [signature, setSignature] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!permis) return;

    setLoading(true);
    try {
      await onValidate(permis.id, commentaire, signature);
      toast.success('Permis validé avec succès');
      onClose();
      setCommentaire('');
      setSignature('');
    } catch (error) {
      toast.error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const getValidationTitle = () => {
    if (!permis) return 'Validation';
    
    switch (permis.statut) {
      case 'EN_ATTENTE':
        return 'Validation Superviseur';
      case 'VALIDE':
        return 'Validation Responsable Zone';
      default:
        return 'Validation';
    }
  };

  const getValidationDescription = () => {
    if (!permis) return '';
    
    switch (permis.statut) {
      case 'EN_ATTENTE':
        return 'Vous êtes sur le point de valider ce permis en tant que superviseur. Cette action déclenchera la validation par le responsable de zone.';
      case 'VALIDE':
        return 'Vous êtes sur le point de valider ce permis en tant que responsable de zone. Cette action rendra le permis actif.';
      default:
        return 'Vous êtes sur le point de valider ce permis.';
    }
  };

  const getNextStep = () => {
    if (!permis) return '';
    
    switch (permis.statut) {
      case 'EN_ATTENTE':
        return 'Validation par le responsable de zone';
      case 'VALIDE':
        return 'Permis actif et prêt à être utilisé';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            {getValidationTitle()}
          </DialogTitle>
          <DialogDescription>
            {getValidationDescription()}
          </DialogDescription>
        </DialogHeader>

        {permis && (
          <div className="space-y-6">
            {/* Informations du permis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{permis.titre}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">N° {permis.numero_permis}</Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    {permis.type_permis_nom}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800">
                    {permis.zone_nom}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Demandeur:</span>
                    <p className="text-gray-600">{permis.demandeur_prenom} {permis.demandeur_nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Période:</span>
                    <p className="text-gray-600">
                      {new Date(permis.date_debut).toLocaleDateString('fr-FR')} - {new Date(permis.date_fin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Étapes de validation */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Étapes de validation</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    permis.statut === 'EN_ATTENTE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    ✓
                  </div>
                  <span className={`text-sm ${
                    permis.statut === 'EN_ATTENTE' ? 'text-green-800 font-medium' : 'text-gray-600'
                  }`}>
                    Validation Superviseur {permis.statut === 'EN_ATTENTE' ? '(En cours)' : '(Terminée)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    permis.statut === 'VALIDE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {permis.statut === 'VALIDE' ? '✓' : '2'}
                  </div>
                  <span className={`text-sm ${
                    permis.statut === 'VALIDE' ? 'text-green-800 font-medium' : 'text-gray-600'
                  }`}>
                    Validation Responsable Zone {permis.statut === 'VALIDE' ? '(En cours)' : '(En attente)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-gray-100 text-gray-600">
                    3
                  </div>
                  <span className="text-sm text-gray-600">
                    Validation HSE (En attente)
                  </span>
                </div>
              </div>
            </div>

            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="commentaire">
                Commentaire de validation <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="commentaire"
                placeholder="Ajoutez un commentaire sur votre validation..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Signature */}
            <div className="space-y-2">
              <Label htmlFor="signature">
                Signature numérique
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Signature className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Signature automatique basée sur votre profil
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSignature('signature_' + Date.now())}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter signature
                </Button>
              </div>
            </div>

            {/* Prochaine étape */}
            {getNextStep() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Prochaine étape</h4>
                    <p className="text-sm text-blue-700">{getNextStep()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !commentaire.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Validation...' : 'Valider le permis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
