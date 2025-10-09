import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Eye,
  Edit,
  Play,
  Pause,
  Archive
} from 'lucide-react';
import { Permis, StatutPermis } from '@/types';
import { STATUT_LABELS, STATUT_COLORS } from '@/utils/constants';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PermisCardProps {
  permis: Permis;
  onView?: (permis: Permis) => void;
  onEdit?: (permis: Permis) => void;
  onValidate?: (permis: Permis) => void;
  onSuspend?: (permis: Permis) => void;
  onClose?: (permis: Permis) => void;
  onExportPDF?: (permis: Permis) => void;
  userRole?: string;
  userId?: string;
}

export const PermisCard: React.FC<PermisCardProps> = ({
  permis,
  onView,
  onEdit,
  onValidate,
  onSuspend,
  onClose,
  onExportPDF,
  userRole,
  userId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (statut: StatutPermis) => {
    switch (statut) {
      case StatutPermis.BROUILLON:
        return <FileText className="h-4 w-4" />;
      case StatutPermis.EN_ATTENTE:
        return <Clock className="h-4 w-4" />;
      case StatutPermis.VALIDE:
        return <CheckCircle className="h-4 w-4" />;
      case StatutPermis.EN_COURS:
        return <Play className="h-4 w-4" />;
      case StatutPermis.SUSPENDU:
        return <Pause className="h-4 w-4" />;
      case StatutPermis.CLOTURE:
        return <Archive className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isExpired = new Date(permis.date_fin) < new Date();
  const isExpiringSoon = new Date(permis.date_fin) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const canEdit = ['BROUILLON', 'EN_ATTENTE'].includes(permis.statut) && 
                 (userRole === 'HSE' || permis.demandeur_id === userId);

  const canValidate = (() => {
    switch (permis.statut) {
      case 'EN_ATTENTE':
        return ['SUPERVISEUR', 'HSE'].includes(userRole || '');
      case 'VALIDE':
        return ['RESP_ZONE', 'HSE'].includes(userRole || '');
      default:
        return false;
    }
  })();

  const canSuspend = ['RESP_ZONE', 'HSE'].includes(userRole || '') && 
                    ['VALIDE', 'EN_COURS'].includes(permis.statut);

  const canClose = ['HSE', 'SUPERVISEUR'].includes(userRole || '') || 
                  (userRole === 'DEMANDEUR' && permis.demandeur_id === userId);

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isExpired ? 'border-red-200 bg-red-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {permis.titre}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${STATUT_COLORS[permis.statut]} flex items-center gap-1`}>
                {getStatusIcon(permis.statut)}
                {STATUT_LABELS[permis.statut]}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Expiré
                </Badge>
              )}
              {isExpiringSoon && !isExpired && (
                <Badge variant="outline" className="border-yellow-300 text-yellow-700 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Expire bientôt
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(permis)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onExportPDF && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onExportPDF(permis)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Informations principales */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span className="font-medium">N° {permis.numero_permis}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-4 w-4" />
              <span>{permis.demandeur_prenom} {permis.demandeur_nom}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{permis.zone_nom}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(permis.date_debut), 'dd/MM/yyyy', { locale: fr })}</span>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-gray-600">
            <p className="line-clamp-2">{permis.description}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(permis)}
                className="flex items-center gap-1"
              >
                <Edit className="h-3 w-3" />
                Modifier
              </Button>
            )}
            
            {canValidate && onValidate && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onValidate(permis)}
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Valider
              </Button>
            )}
            
            {canSuspend && onSuspend && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSuspend(permis)}
                className="flex items-center gap-1 border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <Pause className="h-3 w-3" />
                Suspendre
              </Button>
            )}
            
            {canClose && onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClose(permis)}
                className="flex items-center gap-1"
              >
                <Archive className="h-3 w-3" />
                Clôturer
              </Button>
            )}
          </div>

          {/* Détails supplémentaires */}
          {isExpanded && (
            <div className="pt-3 border-t space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-600">{permis.type_permis_nom}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Fin:</span>
                  <p className="text-gray-600">
                    {format(new Date(permis.date_fin), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
              
              {permis.conditions_prealables && Object.keys(permis.conditions_prealables).length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Conditions préalables:</span>
                  <ul className="text-gray-600 text-xs mt-1">
                    {Object.entries(permis.conditions_prealables).slice(0, 3).map(([key, value]) => (
                      <li key={key}>• {key}: {value}</li>
                    ))}
                    {Object.keys(permis.conditions_prealables).length > 3 && (
                      <li>• ... et {Object.keys(permis.conditions_prealables).length - 3} autres</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Bouton pour développer/réduire */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? 'Réduire' : 'Voir plus'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
