import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Calendar, 
  MapPin, 
  FileText, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { PermisService } from '@/services/permisService';
import { ZoneService } from '@/services/zoneService';
import { TypePermisService } from '@/services/typePermisService';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePermisData, Zone, TypePermis, StatutPermis } from '@/types';
import { STATUT_LABELS } from '@/utils/constants';
import { toast } from 'sonner';
import { format, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PermisCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // États
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [types, setTypes] = useState<TypePermis[]>([]);
  
  // Formulaire
  const [formData, setFormData] = useState<CreatePermisData>({
    type_permis_id: '',
    zone_id: '',
    titre: '',
    description: '',
    date_debut: '',
    date_fin: '',
    conditions_prealables: {},
    mesures_prevention: {},
    resultat_tests_atmos: {}
  });
  
  // États des étapes
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState([
    { id: 1, title: 'Informations générales', completed: false },
    { id: 2, title: 'Conditions préalables', completed: false },
    { id: 3, title: 'Mesures de prévention', completed: false },
    { id: 4, title: 'Tests atmosphériques', completed: false },
    { id: 5, title: 'Validation', completed: false }
  ]);

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Générer le numéro de permis
  useEffect(() => {
    if (formData.titre && formData.type_permis_id && formData.zone_id) {
      const numeroPermis = PermisService.genererNumeroPermis();
      setFormData(prev => ({ ...prev, numero_permis: numeroPermis }));
    }
  }, [formData.titre, formData.type_permis_id, formData.zone_id]);

  // Charger les conditions/mesures par défaut selon le type
  useEffect(() => {
    if (formData.type_permis_id) {
      const type = types.find(t => t.id === formData.type_permis_id);
      if (type) {
        const conditions = TypePermisService.obtenirConditionsPrealables(type.id);
        const mesures = TypePermisService.obtenirMesuresPrevention(type.id);
        
        setFormData(prev => ({
          ...prev,
          conditions_prealables: conditions,
          mesures_prevention: mesures
        }));
      }
    }
  }, [formData.type_permis_id, types]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [zonesData, typesData] = await Promise.all([
        ZoneService.listerZones(),
        TypePermisService.listerTypesPermis()
      ]);
      
      setZones(zonesData);
      setTypes(typesData);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConditionChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      conditions_prealables: {
        ...prev.conditions_prealables,
        [key]: value
      }
    }));
  };

  const handleMesureChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      mesures_prevention: {
        ...prev.mesures_prevention,
        [key]: value
      }
    }));
  };

  const handleTestChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      resultat_tests_atmos: {
        ...prev.resultat_tests_atmos,
        [key]: value
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.type_permis_id && formData.zone_id && formData.titre && formData.description && formData.date_debut && formData.date_fin);
      case 2:
        return Object.keys(formData.conditions_prealables || {}).length > 0;
      case 3:
        return Object.keys(formData.mesures_prevention || {}).length > 0;
      case 4:
        return true; // Tests optionnels
      case 5:
        return true; // Validation finale
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      const updatedSteps = steps.map(step => 
        step.id === currentStep ? { ...step, completed: true } : step
      );
      setSteps(updatedSteps);
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    } else {
      toast.error('Veuillez remplir tous les champs obligatoires');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const saveAsDraft = async () => {
    try {
      setSaving(true);
      await PermisService.creerPermis({
        ...formData,
        statut: StatutPermis.BROUILLON
      });
      toast.success('Permis sauvegardé comme brouillon');
      navigate('/permis');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const submitForValidation = async () => {
    try {
      setSaving(true);
      await PermisService.creerPermis({
        ...formData,
        statut: StatutPermis.EN_ATTENTE
      });
      toast.success('Permis soumis pour validation');
      navigate('/permis');
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="type_permis_id">Type de permis *</Label>
                <Select
                  value={formData.type_permis_id}
                  onValueChange={(value) => handleInputChange('type_permis_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {type.nom}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone_id">Zone d'intervention *</Label>
                <Select
                  value={formData.zone_id}
                  onValueChange={(value) => handleInputChange('zone_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {zone.nom}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titre">Titre du permis *</Label>
              <Input
                id="titre"
                placeholder="Ex: Travaux de maintenance électrique"
                value={formData.titre}
                onChange={(e) => handleInputChange('titre', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez les travaux à effectuer..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date et heure de début *</Label>
                <Input
                  id="date_debut"
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => handleInputChange('date_debut', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_fin">Date et heure de fin *</Label>
                <Input
                  id="date_fin"
                  type="datetime-local"
                  value={formData.date_fin}
                  onChange={(e) => handleInputChange('date_fin', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Conditions préalables</h4>
                  <p className="text-sm text-blue-700">
                    Définissez les conditions qui doivent être remplies avant le début des travaux.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(formData.conditions_prealables || {}).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`condition_${key}`}>{key}</Label>
                  <Input
                    id={`condition_${key}`}
                    value={value}
                    onChange={(e) => handleConditionChange(key, e.target.value)}
                    placeholder="Décrivez cette condition..."
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const key = prompt('Nom de la nouvelle condition:');
                  if (key) {
                    handleConditionChange(key, '');
                  }
                }}
              >
                + Ajouter une condition
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Mesures de prévention</h4>
                  <p className="text-sm text-green-700">
                    Définissez les mesures de sécurité à mettre en place pendant les travaux.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(formData.mesures_prevention || {}).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`mesure_${key}`}>{key}</Label>
                  <Input
                    id={`mesure_${key}`}
                    value={value}
                    onChange={(e) => handleMesureChange(key, e.target.value)}
                    placeholder="Décrivez cette mesure..."
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const key = prompt('Nom de la nouvelle mesure:');
                  if (key) {
                    handleMesureChange(key, '');
                  }
                }}
              >
                + Ajouter une mesure
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Tests atmosphériques</h4>
                  <p className="text-sm text-yellow-700">
                    Enregistrez les résultats des tests atmosphériques (optionnel).
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oxygene">Oxygène (%)</Label>
                  <Input
                    id="oxygene"
                    type="number"
                    step="0.1"
                    placeholder="20.9"
                    value={formData.resultat_tests_atmos?.oxygene || ''}
                    onChange={(e) => handleTestChange('oxygene', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="methane">Méthane (%)</Label>
                  <Input
                    id="methane"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.resultat_tests_atmos?.methane || ''}
                    onChange={(e) => handleTestChange('methane', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="h2s">H2S (ppm)</Label>
                  <Input
                    id="h2s"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={formData.resultat_tests_atmos?.h2s || ''}
                    onChange={(e) => handleTestChange('h2s', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentaire_tests">Commentaire sur les tests</Label>
                <Textarea
                  id="commentaire_tests"
                  placeholder="Commentaires sur les résultats des tests..."
                  value={formData.resultat_tests_atmos?.commentaire || ''}
                  onChange={(e) => handleTestChange('commentaire', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Récapitulatif du permis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <p className="text-gray-900">{types.find(t => t.id === formData.type_permis_id)?.nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Zone:</span>
                    <p className="text-gray-900">{zones.find(z => z.id === formData.zone_id)?.nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Titre:</span>
                    <p className="text-gray-900">{formData.titre}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700">Début:</span>
                    <p className="text-gray-900">
                      {formData.date_debut ? format(new Date(formData.date_debut), 'dd/MM/yyyy HH:mm', { locale: fr }) : ''}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fin:</span>
                    <p className="text-gray-900">
                      {formData.date_fin ? format(new Date(formData.date_fin), 'dd/MM/yyyy HH:mm', { locale: fr }) : ''}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Demandeur:</span>
                    <p className="text-gray-900">{user?.prenom} {user?.nom}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-2">Conditions préalables:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(formData.conditions_prealables || {}).map(([key, value]) => (
                    <li key={key}>• {key}: {value}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Mesures de prévention:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Object.entries(formData.mesures_prevention || {}).map(([key, value]) => (
                    <li key={key}>• {key}: {value}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Workflow de validation</h4>
                  <p className="text-sm text-blue-700">
                    Après soumission, le permis suivra le processus de validation :
                    Superviseur → Responsable Zone → HSE → Actif
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/permis')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Nouveau Permis de Travail</h1>
              <p className="text-muted-foreground mt-2">
                Créez un nouveau permis de travail sécurisé
              </p>
            </div>
          </div>
        </div>

        {/* Étapes */}
        <Card>
          <CardHeader>
            <CardTitle>Étapes de création</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.id < currentStep ? 'bg-green-500 border-green-500 text-white' :
                    step.id === currentStep ? 'bg-primary border-primary text-white' :
                    'bg-gray-100 border-gray-300 text-gray-500'
                  }`}>
                    {step.id < currentStep ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contenu de l'étape */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Précédent
              </Button>
            )}
            {currentStep < steps.length && (
              <Button onClick={nextStep}>
                Suivant
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveAsDraft}
              disabled={saving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Sauvegarder comme brouillon
            </Button>
            
            {currentStep === steps.length && (
              <Button
                onClick={submitForValidation}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Soumettre pour validation
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}