import { useState } from 'react';
import { Plus, Search, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { DataTable } from '@/components/common/DataTable';

// Mock data for demonstration
const mockZones = [
  {
    id: '1',
    nom: 'Zone A - Production',
    description: 'Zone de production principale',
    responsable_nom: 'Jean Dupont',
    responsable_prenom: 'Jean',
    nombre_permis: 15,
    permis_actifs: 8
  },
  {
    id: '2',
    nom: 'Zone B - Maintenance',
    description: 'Zone de maintenance et réparation',
    responsable_nom: 'Marie Martin',
    responsable_prenom: 'Marie',
    nombre_permis: 12,
    permis_actifs: 5
  },
  {
    id: '3',
    nom: 'Zone C - Stockage',
    description: 'Zone de stockage et logistique',
    responsable_nom: 'Pierre Durand',
    responsable_prenom: 'Pierre',
    nombre_permis: 8,
    permis_actifs: 3
  }
];

export default function Zones() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      key: 'nom',
      label: 'Nom de la zone',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true
    },
    {
      key: 'responsable_nom',
      label: 'Responsable',
      render: (value: string, row: any) => `${row.responsable_prenom} ${value}`
    },
    {
      key: 'nombre_permis',
      label: 'Total permis',
      sortable: true
    },
    {
      key: 'permis_actifs',
      label: 'Permis actifs',
      render: (value: number) => (
        <Badge variant={value > 0 ? 'default' : 'secondary'}>
          {value} actif{value > 1 ? 's' : ''}
        </Badge>
      )
    }
  ];

  const filteredData = mockZones.filter(zone =>
    zone.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.responsable_nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Zones</h1>
            <p className="text-muted-foreground">Gérez les zones de travail</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle zone
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {mockZones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{zone.nom}</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{zone.nombre_permis}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {zone.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="mr-1 h-3 w-3" />
                  {zone.responsable_prenom} {zone.responsable_nom}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des zones</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher une zone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredData}
              columns={columns}
              searchable={false}
              pagination={true}
              pageSize={10}
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}