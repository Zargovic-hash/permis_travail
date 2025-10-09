import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlusCircle, 
  Download, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Archive,
  Play,
  Pause
} from 'lucide-react';
import { PermisCard } from '@/components/permis/PermisCard';
import { PermisFilters } from '@/components/permis/PermisFilters';
import { ValidationDialog } from '@/components/permis/ValidationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { PermisService } from '@/services/permisService';
import { ZoneService } from '@/services/zoneService';
import { TypePermisService } from '@/services/typePermisService';
import { UtilisateurService } from '@/services/utilisateurService';
import { Permis, StatutPermis, Zone, TypePermis, Utilisateur } from '@/types';
import { STATUT_LABELS, STATUT_COLORS } from '@/utils/constants';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Permis() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // États
  const [permis, setPermis] = useState<Permis[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [types, setTypes] = useState<TypePermis[]>([]);
  const [demandeurs, setDemandeurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  
  // Filtres
  const [filters, setFilters] = useState({
    search: '',
    zone_id: '',
    type_permis_id: '',
    statut: '',
    demandeur_id: '',
    date_debut: '',
    date_fin: ''
  });
  
  // Dialogues
  const [validationDialog, setValidationDialog] = useState<{
    isOpen: boolean;
    permis: Permis | null;
  }>({
    isOpen: false,
    permis: null
  });

  // Charger les données initiales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Charger les permis quand les filtres changent
  useEffect(() => {
    loadPermis();
  }, [filters, pagination.page]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadZones(),
        loadTypes(),
        loadDemandeurs(),
        loadPermis()
      ]);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadPermis = async () => {
    try {
      const response = await PermisService.listerPermis(filters, {
        page: pagination.page,
        limit: pagination.limit
      });
      
      setPermis(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages
      }));
    } catch (error) {
      toast.error('Erreur lors du chargement des permis');
    }
  };

  const loadZones = async () => {
    try {
      const zonesData = await ZoneService.listerZones();
      setZones(zonesData);
    } catch (error) {
      console.error('Erreur lors du chargement des zones:', error);
    }
  };

  const loadTypes = async () => {
    try {
      const typesData = await TypePermisService.listerTypesPermis();
      setTypes(typesData);
    } catch (error) {
      console.error('Erreur lors du chargement des types:', error);
    }
  };

  const loadDemandeurs = async () => {
    try {
      const demandeursData = await UtilisateurService.obtenirDemandeurs();
      setDemandeurs(demandeursData);
    } catch (error) {
      console.error('Erreur lors du chargement des demandeurs:', error);
    }
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      zone_id: '',
      type_permis_id: '',
      statut: '',
      demandeur_id: '',
      date_debut: '',
      date_fin: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = async () => {
    try {
      await PermisService.exporterPDF('all');
      toast.success('Export PDF en cours...');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const handleViewPermis = (permis: Permis) => {
    navigate(`/permis/${permis.id}`);
  };

  const handleEditPermis = (permis: Permis) => {
    navigate(`/permis/${permis.id}/edit`);
  };

  const handleValidatePermis = (permis: Permis) => {
    setValidationDialog({
      isOpen: true,
      permis
    });
  };

  const handleConfirmValidation = async (permisId: string, commentaire: string, signature?: string) => {
    try {
      await PermisService.validerPermis(permisId, { commentaire, signature_image: signature });
      await loadPermis();
      toast.success('Permis validé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la validation');
      throw error;
    }
  };

  const handleSuspendPermis = async (permis: Permis) => {
    try {
      await PermisService.suspendrePermis(permis.id, { raison: 'Suspension manuelle' });
      await loadPermis();
      toast.success('Permis suspendu');
    } catch (error) {
      toast.error('Erreur lors de la suspension');
    }
  };

  const handleClosePermis = async (permis: Permis) => {
    try {
      await PermisService.cloturerPermis(permis.id);
      await loadPermis();
      toast.success('Permis clôturé');
    } catch (error) {
      toast.error('Erreur lors de la clôture');
    }
  };

  const handleExportPDF = async (permis: Permis) => {
    try {
      await PermisService.exporterPDF(permis.id);
      toast.success('PDF téléchargé');
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  const handleRefresh = () => {
    loadPermis();
  };

  // Statistiques rapides
  const stats = {
    total: pagination.total,
    brouillons: permis.filter(p => p.statut === 'BROUILLON').length,
    enAttente: permis.filter(p => p.statut === 'EN_ATTENTE').length,
    valides: permis.filter(p => p.statut === 'VALIDE').length,
    enCours: permis.filter(p => p.statut === 'EN_COURS').length,
    suspendus: permis.filter(p => p.statut === 'SUSPENDU').length,
    clotures: permis.filter(p => p.statut === 'CLOTURE').length
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Permis de Travail</h1>
            <p className="text-muted-foreground mt-2">
              Système de gestion HSE pour les permis de travail sécurisés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={() => navigate('/permis/create')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Nouveau Permis
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold">{stats.brouillons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold">{stats.enAttente}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Validés</p>
                  <p className="text-2xl font-bold">{stats.valides}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold">{stats.enCours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspendus</p>
                  <p className="text-2xl font-bold">{stats.suspendus}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Clôturés</p>
                  <p className="text-2xl font-bold">{stats.clotures}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <PermisFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          onExport={handleExport}
          zones={zones}
          types={types}
          demandeurs={demandeurs}
        />

        {/* Liste des permis */}
        {permis.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun permis trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {Object.values(filters).some(v => v) 
                  ? 'Aucun permis ne correspond aux filtres sélectionnés.'
                  : 'Commencez par créer votre premier permis de travail.'
                }
              </p>
              {!Object.values(filters).some(v => v) && (
                <Button onClick={() => navigate('/permis/create')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Créer un permis
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {permis.map((permisItem) => (
              <PermisCard
                key={permisItem.id}
                permis={permisItem}
                onView={handleViewPermis}
                onEdit={handleEditPermis}
                onValidate={handleValidatePermis}
                onSuspend={handleSuspendPermis}
                onClose={handleClosePermis}
                onExportPDF={handleExportPDF}
                userRole={user?.role}
                userId={user?.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Précédent
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Suivant
            </Button>
          </div>
        )}

        {/* Dialogues */}
        <ValidationDialog
          permis={validationDialog.permis}
          isOpen={validationDialog.isOpen}
          onClose={() => setValidationDialog({ isOpen: false, permis: null })}
          onValidate={handleConfirmValidation}
          userRole={user?.role}
        />
      </div>
    </Layout>
  );
}