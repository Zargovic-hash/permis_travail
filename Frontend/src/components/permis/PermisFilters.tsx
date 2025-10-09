import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  MapPin,
  FileText,
  User,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { StatutPermis } from '@/types';
import { STATUT_LABELS } from '@/utils/constants';

interface PermisFiltersProps {
  filters: {
    search?: string;
    zone_id?: string;
    type_permis_id?: string;
    statut?: StatutPermis;
    demandeur_id?: string;
    date_debut?: string;
    date_fin?: string;
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
  onExport: () => void;
  zones?: Array<{ id: string; nom: string }>;
  types?: Array<{ id: string; nom: string }>;
  demandeurs?: Array<{ id: string; nom: string; prenom: string }>;
}

export const PermisFilters: React.FC<PermisFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onExport,
  zones = [],
  types = [],
  demandeurs = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    filters.date_debut ? new Date(filters.date_debut) : undefined
  );
  const [dateFin, setDateFin] = useState<Date | undefined>(
    filters.date_fin ? new Date(filters.date_fin) : undefined
  );

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleDateChange = (key: 'date_debut' | 'date_fin', date: Date | undefined) => {
    if (key === 'date_debut') {
      setDateDebut(date);
    } else {
      setDateFin(date);
    }
    
    onFiltersChange({
      ...filters,
      [key]: date ? format(date, 'yyyy-MM-dd') : undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Réduire' : 'Étendre'}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recherche principale */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, numéro ou description..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zone
            </label>
            <Select
              value={filters.zone_id || ''}
              onValueChange={(value) => handleFilterChange('zone_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les zones</SelectItem>
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

          {/* Type de permis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de permis
            </label>
            <Select
              value={filters.type_permis_id || ''}
              onValueChange={(value) => handleFilterChange('type_permis_id', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
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

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <Select
              value={filters.statut || ''}
              onValueChange={(value) => handleFilterChange('statut', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {Object.values(StatutPermis).map((statut) => (
                  <SelectItem key={statut} value={statut}>
                    {STATUT_LABELS[statut]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtres avancés */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Demandeur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Demandeur
              </label>
              <Select
                value={filters.demandeur_id || ''}
                onValueChange={(value) => handleFilterChange('demandeur_id', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les demandeurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les demandeurs</SelectItem>
                  {demandeurs.map((demandeur) => (
                    <SelectItem key={demandeur.id} value={demandeur.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {demandeur.prenom} {demandeur.nom}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date de début */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateDebut ? format(dateDebut, 'dd/MM/yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateDebut}
                    onSelect={(date) => handleDateChange('date_debut', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date de fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFin ? format(dateFin, 'dd/MM/yyyy', { locale: fr }) : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFin}
                    onSelect={(date) => handleDateChange('date_fin', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Résumé des filtres actifs */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-medium text-gray-700">Filtres actifs:</span>
            {filters.search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Recherche: {filters.search}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('search', undefined)}
                />
              </Badge>
            )}
            {filters.zone_id && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Zone: {zones.find(z => z.id === filters.zone_id)?.nom}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('zone_id', undefined)}
                />
              </Badge>
            )}
            {filters.type_permis_id && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {types.find(t => t.id === filters.type_permis_id)?.nom}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('type_permis_id', undefined)}
                />
              </Badge>
            )}
            {filters.statut && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Statut: {STATUT_LABELS[filters.statut]}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('statut', undefined)}
                />
              </Badge>
            )}
            {filters.demandeur_id && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Demandeur: {demandeurs.find(d => d.id === filters.demandeur_id)?.prenom} {demandeurs.find(d => d.id === filters.demandeur_id)?.nom}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('demandeur_id', undefined)}
                />
              </Badge>
            )}
            {filters.date_debut && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Début: {format(new Date(filters.date_debut), 'dd/MM/yyyy', { locale: fr })}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleDateChange('date_debut', undefined)}
                />
              </Badge>
            )}
            {filters.date_fin && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Fin: {format(new Date(filters.date_fin), 'dd/MM/yyyy', { locale: fr })}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleDateChange('date_fin', undefined)}
                />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};