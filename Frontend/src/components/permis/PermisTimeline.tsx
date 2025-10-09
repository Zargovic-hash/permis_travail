import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Approbation, StatutApprobation } from '../../types';
import { formatDateTime, formatFullName } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';

interface PermisTimelineProps {
  approbations: Approbation[];
  className?: string;
}

export const PermisTimeline: React.FC<PermisTimelineProps> = ({
  approbations,
  className = ''
}) => {
  const getStatusIcon = (statut: StatutApprobation) => {
    switch (statut) {
      case StatutApprobation.APPROUVE:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case StatutApprobation.REFUSE:
        return <XCircle className="w-6 h-6 text-red-600" />;
      case StatutApprobation.SUSPENDU:
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (statut: StatutApprobation) => {
    switch (statut) {
      case StatutApprobation.APPROUVE:
        return 'bg-green-100 border-green-200 text-green-800';
      case StatutApprobation.REFUSE:
        return 'bg-red-100 border-red-200 text-red-800';
      case StatutApprobation.SUSPENDU:
        return 'bg-orange-100 border-orange-200 text-orange-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getStatusLabel = (statut: StatutApprobation) => {
    switch (statut) {
      case StatutApprobation.APPROUVE:
        return 'Approuvé';
      case StatutApprobation.REFUSE:
        return 'Refusé';
      case StatutApprobation.SUSPENDU:
        return 'Suspendu';
      default:
        return 'En attente';
    }
  };

  if (approbations.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        Aucune approbation pour le moment
      </div>
    );
  }

  return (
    <div className={`flow-root ${className}`}>
      <ul className="-mb-8">
        {approbations.map((approbation, index) => (
          <li key={approbation.id}>
            <div className="relative pb-8">
              {index !== approbations.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex items-start space-x-3">
                {/* Icon */}
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getStatusIcon(approbation.statut)}
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {formatFullName(approbation.prenom, approbation.nom)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {ROLE_LABELS[approbation.role_app]} · {formatDateTime(approbation.date_action)}
                        </p>
                      </div>
                      
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(approbation.statut)}`}>
                        {getStatusLabel(approbation.statut)}
                      </span>
                    </div>

                    {/* Commentaire */}
                    {approbation.commentaire && (
                      <div className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">
                        <p className="italic">"{approbation.commentaire}"</p>
                      </div>
                    )}

                    {/* Signature */}
                    {approbation.signature_image_path && (
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        <span>Signature électronique vérifiée</span>
                        <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                          {approbation.signature_hash.substring(0, 16)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};