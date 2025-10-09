import { useState } from 'react';
import { Download, BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { ChartWrapper } from '@/components/reports/ChartWrapper';
import { StatCard } from '@/components/reports/StatCard';

export default function Rapport() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedZone, setSelectedZone] = useState('all');

  // Mock data for demonstration
  const stats = {
    totalPermis: 156,
    permisValides: 89,
    permisEnAttente: 23,
    permisExpires: 12,
    tauxValidation: 78.5,
    tempsMoyenValidation: 2.3
  };

  const chartData = [
    { name: 'Jan', permis: 12, valides: 10 },
    { name: 'Fév', permis: 15, valides: 12 },
    { name: 'Mar', permis: 18, valides: 15 },
    { name: 'Avr', permis: 22, valides: 18 },
    { name: 'Mai', permis: 19, valides: 16 },
    { name: 'Jun', permis: 25, valides: 20 }
  ];

  const zoneStats = [
    { zone: 'Zone A', total: 45, actifs: 32, clotures: 13 },
    { zone: 'Zone B', total: 38, actifs: 28, clotures: 10 },
    { zone: 'Zone C', total: 42, actifs: 35, clotures: 7 },
    { zone: 'Zone D', total: 31, actifs: 24, clotures: 7 }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rapports</h1>
            <p className="text-muted-foreground">Analysez les données des permis de travail</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exporter Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="quarter">Ce trimestre</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les zones</SelectItem>
                    <SelectItem value="zone-a">Zone A</SelectItem>
                    <SelectItem value="zone-b">Zone B</SelectItem>
                    <SelectItem value="zone-c">Zone C</SelectItem>
                    <SelectItem value="zone-d">Zone D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Permis"
            value={stats.totalPermis}
            icon={BarChart3}
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Permis Validés"
            value={stats.permisValides}
            icon={TrendingUp}
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            title="En Attente"
            value={stats.permisEnAttente}
            icon={Calendar}
            trend="-5%"
            trendUp={false}
          />
          <StatCard
            title="Taux de Validation"
            value={`${stats.tauxValidation}%`}
            icon={TrendingUp}
            trend="+2.1%"
            trendUp={true}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Permis</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartWrapper data={chartData} type="line" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartWrapper data={zoneStats} type="bar" />
            </CardContent>
          </Card>
        </div>

        {/* Zone Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques par Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {zoneStats.map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div>
                      <h4 className="font-medium">{zone.zone}</h4>
                      <p className="text-sm text-muted-foreground">
                        {zone.actifs} actifs, {zone.clotures} clôturés
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{zone.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
