import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreatePermis, useAddFileToPermis } from '../../hooks/usePermis';
import { useZones } from '../../hooks/useZones';
import { useTypesPermis } from '../../hooks/useTypesPermis';
import apiClient from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Card from '../../components/ui/Card';
import Stepper from '../../components/ui/Stepper';
import Alert from '../../components/ui/Alert';
import { ChevronLeft, ChevronRight, Save, Send, Plus, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/formatters';

const schema = yup.object({
  type_permis_id: yup.string().required('Le type de permis est requis'),
  zone_id: yup.string().required('La zone est requise'),
  titre: yup.string().min(5, 'Le titre doit contenir au moins 5 caractères').required('Le titre est requis'),
  description: yup.string(),
  date_debut: yup.date().required('La date de début est requise'),
  date_fin: yup.date()
    .required('La date de fin est requise')
    .min(yup.ref('date_debut'), 'La date de fin doit être après la date de début')
});

const steps = [
  'Informations générales',
  'Conditions préalables',
  'Mesures de prévention',
  'Tests atmosphériques',
  'Justificatifs'
];

export default function PermisCreate() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [conditions, setConditions] = useState([{ key: '', value: '' }]);
  const [mesures, setMesures] = useState([{ key: '', value: '' }]);
  const [testsAtmos, setTestsAtmos] = useState({ o2: '', lel: '', co: '', h2s: '', autres: '' });
  const [files, setFiles] = useState([]);

  const { data: zones } = useZones();
  const { data: types } = useTypesPermis();
  const createPermis = useCreatePermis();

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      date_debut: formatDate(new Date(), 'datetime-local'),
      date_fin: ''
    }
  });

  const handleNext = async () => {
    let isValid = true;
    if (currentStep === 0) {
      isValid = await trigger(['type_permis_id', 'zone_id', 'titre', 'description', 'date_debut', 'date_fin']);
    }
    if (isValid && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { key: '', value: '' }]);
  };

  const handleRemoveCondition = (index) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleConditionChange = (index, field, value) => {
    const updated = [...conditions];
    updated[index][field] = value;
    setConditions(updated);
  };

  const handleAddMesure = () => {
    setMesures([...mesures, { key: '', value: '' }]);
  };

  const handleRemoveMesure = (index) => {
    setMesures(mesures.filter((_, i) => i !== index));
  };

  const handleMesureChange = (index, field, value) => {
    const updated = [...mesures];
    updated[index][field] = value;
    setMesures(updated);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const preparePayload = (data, statut = 'BROUILLON') => {
    const conditionsObj = conditions.reduce((acc, c) => {
      if (c.key && c.key.trim()) {
        acc[c.key.trim()] = c.value;
      }
      return acc;
    }, {});

    const mesuresObj = mesures.reduce((acc, m) => {
      if (m.key && m.key.trim()) {
        acc[m.key.trim()] = m.value;
      }
      return acc;
    }, {});

    const testsAtmosObj = Object.entries(testsAtmos).reduce((acc, [key, value]) => {
      if (value && value.trim()) {
        acc[key] = value;
      }
      return acc;
    }, {});

    return {
      ...data,
      statut,
      conditions_prealables: conditionsObj,
      mesures_prevention: mesuresObj,
      resultat_tests_atmos: testsAtmosObj,
    };
  };

  const handleSaveDraft = async (data) => {
    try {
      const payload = preparePayload(data, 'BROUILLON');
      const response = await createPermis.mutateAsync(payload);
      toast.success('Brouillon enregistré avec succès');
      navigate('/permis');
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('fichier', file);
          await apiClient.post(`/permis/${response.data.id}/ajouter-fichier`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
    }
  };

  const handleSubmitForValidation = async (data) => {
    try {
      const payload = preparePayload(data, 'EN_ATTENTE');
      const response = await createPermis.mutateAsync(payload);
      
      if (files.length > 0 && response?.id) {
        for (const file of files) {
          try {
            const formData = new FormData();
            formData.append('fichier', file);
            await apiClient.post(`/permis/${response.id}/ajouter-fichier`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (fileError) {
            console.error('Erreur upload fichier:', fileError);
            toast.warning(`Fichier ${file.name} non uploadé`);
          }
        }
      }
      
      toast.success('Permis soumis pour validation');
      navigate('/permis');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/permis')}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour
          </button>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Nouveau Permis de Travail
              </h1>
              <p className="mt-2 text-base text-slate-600">
                Remplissez toutes les informations nécessaires pour créer un permis
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/permis')}
              className="text-slate-600 hover:text-slate-900"
            >
              Annuler
            </Button>
          </div>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleSubmitForValidation)} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-8">
              {currentStep === 0 && (
                <StepInfos
                  register={register}
                  errors={errors}
                  watch={watch}
                  setValue={setValue}
                  zones={zones?.data || []}
                  types={types?.data || []}
                />
              )}

              {currentStep === 1 && (
                <StepConditions
                  conditions={conditions}
                  onAdd={handleAddCondition}
                  onRemove={handleRemoveCondition}
                  onChange={handleConditionChange}
                />
              )}

              {currentStep === 2 && (
                <StepMesures
                  mesures={mesures}
                  onAdd={handleAddMesure}
                  onRemove={handleRemoveMesure}
                  onChange={handleMesureChange}
                />
              )}

              {currentStep === 3 && (
                <StepTests
                  testsAtmos={testsAtmos}
                  onChange={setTestsAtmos}
                />
              )}

              {currentStep === 4 && (
                <StepFiles
                  files={files}
                  onFileChange={handleFileChange}
                  onRemove={handleRemoveFile}
                />
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              icon={ChevronLeft}
              iconPosition="left"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </Button>

            <Button
              type="button"
              variant="ghost"
              icon={Save}
              onClick={handleSubmit(handleSaveDraft)}
              loading={createPermis.isPending}
              className="text-slate-600 hover:text-slate-900"
            >
              Enregistrer en brouillon
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                icon={ChevronRight}
                iconPosition="right"
                onClick={handleNext}
              >
                Suivant
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                icon={Send}
                loading={createPermis.isPending}
              >
                Soumettre pour validation
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// Step 1: Informations générales
function StepInfos({ register, errors, zones, types }) {
  return (
    <div className="space-y-8">
      <Alert variant="info">
        Commencez par renseigner les informations de base du permis de travail.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Type de permis"
          {...register('type_permis_id')}
          error={errors.type_permis_id?.message}
          required
          options={[
            ...types.map(t => ({ value: t.id, label: t.nom }))
          ]}
        />

        <Select
          label="Zone"
          {...register('zone_id')}
          error={errors.zone_id?.message}
          required
          options={[
            ...zones.map(z => ({ value: z.id, label: z.nom }))
          ]}
        />
      </div>

      <Input
        label="Titre du permis"
        {...register('titre')}
        error={errors.titre?.message}
        required
        placeholder="Ex: Soudure de réparation sur structure métallique"
        helperText="Décrivez brièvement les travaux à effectuer"
      />

      <Textarea
        label="Description détaillée"
        {...register('description')}
        error={errors.description?.message}
        rows={4}
        placeholder="Décrivez en détail les travaux à effectuer, les zones concernées, les équipements utilisés..."
        maxLength={1000}
        showCount
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          type="datetime-local"
          label="Date et heure de début"
          {...register('date_debut')}
          error={errors.date_debut?.message}
          required
        />

        <Input
          type="datetime-local"
          label="Date et heure de fin"
          {...register('date_fin')}
          error={errors.date_fin?.message}
          required
        />
      </div>
    </div>
  );
}

// Step 2: Conditions préalables
function StepConditions({ conditions, onAdd, onRemove, onChange }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Conditions préalables</h3>
          <p className="text-sm text-slate-600 mt-1">
            Listez toutes les conditions qui doivent être remplies avant le début des travaux
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={onAdd}
        >
          Ajouter
        </Button>
      </div>

      {conditions.length === 0 ? (
        <Alert variant="info">
          Aucune condition ajoutée. Cliquez sur "Ajouter" pour commencer.
        </Alert>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={index === 0 ? "Condition" : undefined}
                  placeholder="Ex: Isolation électrique"
                  value={condition.key}
                  onChange={(e) => onChange(index, 'key', e.target.value)}
                />
                <Input
                  label={index === 0 ? "Description" : undefined}
                  placeholder="Ex: Disjoncteur verrouillé et étiqueté"
                  value={condition.value}
                  onChange={(e) => onChange(index, 'value', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={`p-2 text-slate-400 hover:text-red-600 transition-colors ${index === 0 ? 'mt-8' : ''}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Alert variant="warning">
        <strong>Important :</strong> Toutes les conditions doivent être vérifiées et validées avant le début des travaux.
      </Alert>
    </div>
  );
}

// Step 3: Mesures de prévention
function StepMesures({ mesures, onAdd, onRemove, onChange }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Mesures de prévention</h3>
          <p className="text-sm text-slate-600 mt-1">
            Définissez les mesures de sécurité et équipements de protection requis
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={Plus}
          onClick={onAdd}
        >
          Ajouter
        </Button>
      </div>

      {mesures.length === 0 ? (
        <Alert variant="info">
          Aucune mesure ajoutée. Cliquez sur "Ajouter" pour commencer.
        </Alert>
      ) : (
        <div className="space-y-3">
          {mesures.map((mesure, index) => (
            <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={index === 0 ? "Mesure" : undefined}
                  placeholder="Ex: EPI requis"
                  value={mesure.key}
                  onChange={(e) => onChange(index, 'key', e.target.value)}
                />
                <Input
                  label={index === 0 ? "Description" : undefined}
                  placeholder="Ex: Casque, gants isolants, chaussures de sécurité"
                  value={mesure.value}
                  onChange={(e) => onChange(index, 'value', e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={`p-2 text-slate-400 hover:text-red-600 transition-colors ${index === 0 ? 'mt-8' : ''}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Alert variant="info">
        <strong>Suggestions :</strong> EPI, signalisation, périmètre de sécurité, surveillance continue, extincteurs, ventilation, etc.
      </Alert>
    </div>
  );
}

// Step 4: Tests atmosphériques
function StepTests({ testsAtmos, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...testsAtmos, [key]: value });
  };

  const isInRange = (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Tests atmosphériques</h3>
        <p className="text-sm text-slate-600 mt-1">
          Renseignez les résultats des mesures atmosphériques si applicable
        </p>
      </div>

      <Alert variant="info">
        Ces tests sont particulièrement importants pour les espaces confinés et les permis feu.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            type="number"
            step="0.1"
            label="Oxygène (O2) %"
            placeholder="Ex: 20.8"
            value={testsAtmos.o2}
            onChange={(e) => handleChange('o2', e.target.value)}
            helperText="Plage normale: 19.5% - 23.5%"
          />
          {testsAtmos.o2 && !isInRange(testsAtmos.o2, 19.5, 23.5) && (
            <Alert variant="danger" className="mt-2">
              ⚠️ Valeur hors de la plage de sécurité !
            </Alert>
          )}
        </div>

        <div>
          <Input
            type="number"
            step="0.1"
            label="Limite Inférieure d'Explosivité (LEL) %"
            placeholder="Ex: 0"
            value={testsAtmos.lel}
            onChange={(e) => handleChange('lel', e.target.value)}
            helperText="Doit être < 10%"
          />
          {testsAtmos.lel && parseFloat(testsAtmos.lel) >= 10 && (
            <Alert variant="danger" className="mt-2">
              ⚠️ Risque d'explosion ! LEL trop élevé
            </Alert>
          )}
        </div>

        <div>
          <Input
            type="number"
            step="1"
            label="Monoxyde de Carbone (CO) ppm"
            placeholder="Ex: 5"
            value={testsAtmos.co}
            onChange={(e) => handleChange('co', e.target.value)}
            helperText="Doit être < 50 ppm"
          />
          {testsAtmos.co && parseFloat(testsAtmos.co) >= 50 && (
            <Alert variant="warning" className="mt-2">
              ⚠️ Niveau de CO élevé
            </Alert>
          )}
        </div>

        <div>
          <Input
            type="number"
            step="1"
            label="Sulfure d'Hydrogène (H2S) ppm"
            placeholder="Ex: 0"
            value={testsAtmos.h2s}
            onChange={(e) => handleChange('h2s', e.target.value)}
            helperText="Doit être < 10 ppm"
          />
          {testsAtmos.h2s && parseFloat(testsAtmos.h2s) >= 10 && (
            <Alert variant="danger" className="mt-2">
              ⚠️ Niveau de H2S dangereux !
            </Alert>
          )}
        </div>
      </div>

      <Textarea
        label="Autres mesures"
        placeholder="Indiquez tout autre test ou mesure effectué (température, humidité, autres gaz...)"
        value={testsAtmos.autres}
        onChange={(e) => handleChange('autres', e.target.value)}
        rows={3}
      />

      <Alert variant="warning">
        <strong>Rappel :</strong> Les tests atmosphériques doivent être effectués par du personnel qualifié avec des appareils calibrés.
      </Alert>
    </div>
  );
}

// Step 5: Justificatifs
function StepFiles({ files, onFileChange, onRemove }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Justificatifs et documents</h3>
        <p className="text-sm text-slate-600 mt-1">
          Ajoutez les documents nécessaires (plans, analyses de risque, certificats...)
        </p>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={onFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-3">
            <div className="flex justify-center">
              <Plus className="w-12 h-12 text-slate-400" />
            </div>
            <div className="text-sm text-slate-600">
              <span className="font-medium text-indigo-600">Cliquez pour télécharger</span>
              {' '}ou glissez-déposez
            </div>
            <p className="text-xs text-slate-500">
              PDF, JPG, PNG jusqu'à 10MB
            </p>
          </div>
        </label>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-900">
            Fichiers sélectionnés ({files.length})
          </h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {file.type.includes('pdf') ? (
                    <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold text-red-700">PDF</span>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-700">IMG</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-4 p-2 text-slate-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Alert variant="info">
        <strong>Note :</strong> Les fichiers seront téléchargés après la création du permis. Vous pourrez également ajouter d'autres documents plus tard.
      </Alert>
    </div>
  );
}