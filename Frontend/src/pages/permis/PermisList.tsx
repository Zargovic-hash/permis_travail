import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockPermis = [
  {
    id: '1',
    numero: 'PTH-2024-001',
    titre: 'Travaux en Hauteur - Bâtiment A',
    zone: 'Zone Production',
    statut: 'APPROUVE',
    date_debut: '2024-01-15',
    demandeur: 'Jean Dupont',
  },
  {
    id: '2',
    numero: 'PTE-2024-002',
    titre: 'Travaux Électriques - Poste 5',
    zone: 'Zone Technique',
    statut: 'EN_ATTENTE',
    date_debut: '2024-01-16',
    demandeur: 'Marie Martin',
  },
  {
    id: '3',
    numero: 'PTC-2024-003',
    titre: 'Travaux à Chaud - Atelier',
    zone: 'Zone Maintenance',
    statut: 'EN_COURS',
    date_debut: '2024-01-14',
    demandeur: 'Pierre Dubois',
  },
];

const statusColors = {
  BROUILLON: 'bg-muted',
  EN_ATTENTE: 'bg-warning/10 text-warning',
  APPROUVE: 'bg-success/10 text-success',
  REJETE: 'bg-destructive/10 text-destructive',
  EN_COURS: 'bg-primary/10 text-primary',
  SUSPENDU: 'bg-warning/10 text-warning',
  CLOTURE: 'bg-muted',
};

const statusLabels = {
  BROUILLON: 'Brouillon',
  EN_ATTENTE: 'En Attente',
  APPROUVE: 'Approuvé',
  REJETE: 'Rejeté',
  EN_COURS: 'En Cours',
  SUSPENDU: 'Suspendu',
  CLOTURE: 'Clôturé',
};

export default function PermisList() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mes Permis</h1>
            <p className="text-muted-foreground mt-2">
              Gérez et suivez tous vos permis de travail
            </p>
          </div>
          <Link to="/permis/nouveau">
            <Button className="bg-accent hover:bg-accent-hover">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Permis
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un permis..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Permis List */}
        <div className="space-y-4">
          {mockPermis.map((permis) => (
            <Card key={permis.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{permis.titre}</CardTitle>
                      <Badge variant="outline" className="font-mono text-xs">
                        {permis.numero}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{permis.zone}</span>
                      <span>•</span>
                      <span>Demandeur: {permis.demandeur}</span>
                      <span>•</span>
                      <span>Début: {new Date(permis.date_debut).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                  <Badge className={statusColors[permis.statut as keyof typeof statusColors]}>
                    {statusLabels[permis.statut as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Link to={`/permis/${permis.id}`}>
                    <Button variant="outline" size="sm">
                      Voir Détails
                    </Button>
                  </Link>
                  <Link to={`/permis/${permis.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
