import { useState } from 'react';
import { Plus, Search, ClipboardList, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { DataTable } from '@/components/common/DataTable';

// Mock data for demonstration
const mockTypes = [
  {
    id: '1',
    nom: 'Permis électrique',
    description: 'Permis pour travaux électriques',
    nombre_permis: 25,
    permis_actifs: 12
  },
  {
    id: '2',
    nom: 'Permis de travail en hauteur',
    description: 'Permis pour travaux en hauteur',
    nombre_permis: 18,
    permis_actifs: 8
  },
  {
    id: '3',
    nom: 'Permis de soudage',
    description: 'Permis pour travaux de soudage',
    nombre_permis: 15,
    permis_actifs: 6
  },
  {
    id: '4',
    nom: 'Permis d\'excavation',
    description: 'Permis pour travaux d\'excavation',
    nombre_permis: 10,
    permis_actifs: 4
  }
];

export default function TypesPermis() {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    {
      key: 'nom',
      label: 'Nom du type',
      sortable: true
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true
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

  const filteredData = mockTypes.filter(type =>
    type.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Types de permis</h1>
            <p className="text-muted-foreground">Gérez les types de permis de travail</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau type
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {mockTypes.map((type) => (
            <Card key={type.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{type.nom}</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{type.nombre_permis}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {type.description}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <FileText className="mr-1 h-3 w-3" />
                  {type.permis_actifs} actif{type.permis_actifs > 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Liste des types</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Rechercher un type..."
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