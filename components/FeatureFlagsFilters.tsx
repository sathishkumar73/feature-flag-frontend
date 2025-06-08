"use client";
import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlagEnvironmentFilter, FlagStatusFilter } from '@/types/flag';

interface FeatureFlagsFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  environmentFilter: FlagEnvironmentFilter;
  onEnvironmentFilterChange: (env: FlagEnvironmentFilter) => void;
  statusFilter: FlagStatusFilter;
  onStatusFilterChange: (status: FlagStatusFilter) => void;
  onExportCSV: () => void;
  totalFilteredFlags: number; // To display summary count
}

const FeatureFlagsFilters: React.FC<FeatureFlagsFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  environmentFilter,
  onEnvironmentFilterChange,
  statusFilter,
  onStatusFilterChange,
  onExportCSV,
  totalFilteredFlags
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Filters & Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by flag name or description..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
                aria-label="Search feature flags"
              />
            </div>

            {/* Environment Filter */}
            <Select value={environmentFilter} onValueChange={onEnvironmentFilterChange}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Environments</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Staging">Staging</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Enabled">Enabled</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button onClick={onExportCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV ({totalFilteredFlags})
          </Button>
        </div>
        {/* Results Summary */}
        <div className="text-sm text-muted-foreground mt-4">
          Showing {totalFilteredFlags} feature flags
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureFlagsFilters;