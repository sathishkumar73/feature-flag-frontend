"use client";
import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditLogActionFilter, AuditLogStatusFilter } from '@/components/types/audit-log';

interface AuditLogsFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  actionFilter: AuditLogActionFilter;
  onActionFilterChange: (action: AuditLogActionFilter) => void;
  statusFilter: AuditLogStatusFilter;
  onStatusFilterChange: (status: AuditLogStatusFilter) => void;
  onExportCSV: () => void;
  totalFilteredLogsCount: number; // To show count before export
}

const AuditLogsFilters: React.FC<AuditLogsFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  actionFilter,
  onActionFilterChange,
  statusFilter,
  onStatusFilterChange,
  onExportCSV,
  totalFilteredLogsCount
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-medium text-foreground">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by user, flag, or details..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div className="space-y-2">
            <label htmlFor="action-filter" className="text-sm font-medium text-foreground">
              Action Type
            </label>
            <Select value={actionFilter} onValueChange={onActionFilterChange}>
              <SelectTrigger id="action-filter" className="w-full">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="Create">Create</SelectItem>
                <SelectItem value="Update">Update</SelectItem>
                <SelectItem value="Delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label htmlFor="status-filter" className="text-sm font-medium text-foreground">
              Status
            </label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger id="status-filter" className="w-full">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failure">Failure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Export</label>
            <Button
              onClick={onExportCSV}
              variant="outline"
              className="w-full"
              aria-label="Export audit logs to CSV"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV ({totalFilteredLogsCount})
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogsFilters;