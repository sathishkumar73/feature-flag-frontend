"use client";

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Copy, Eye, ChevronUp, ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import CreateFlagModal from '@/components/CreateFlagModal';
import ToggleFlagModal from '@/components/ToggleFlagModal';
import FeatureFlagModal from '@/components/FeatureFlagModal';

// Mock data for feature flags
const initialFlags = [
  {
    id: 'flag_001',
    name: 'new-checkout-flow',
    description: 'Enable the new streamlined checkout process with improved UX and conversion tracking',
    environment: 'Production',
    enabled: true,
    rolloutPercentage: 75,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z'
  },
  {
    id: 'flag_002',
    name: 'dark-mode-toggle',
    description: 'Allow users to switch between light and dark themes',
    environment: 'Staging',
    enabled: false,
    rolloutPercentage: 0,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T16:20:00Z'
  },
  {
    id: 'flag_003',
    name: 'advanced-analytics',
    description: 'Show advanced analytics dashboard with detailed metrics and reporting capabilities for premium users',
    environment: 'Development',
    enabled: true,
    rolloutPercentage: 100,
    createdAt: '2024-01-12T11:45:00Z',
    updatedAt: '2024-01-22T13:30:00Z'
  },
  {
    id: 'flag_004',
    name: 'social-login',
    description: 'Enable social media login options (Google, GitHub, Discord)',
    environment: 'Production',
    enabled: true,
    rolloutPercentage: 50,
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-21T10:15:00Z'
  },
  {
    id: 'flag_005',
    name: 'beta-features',
    description: 'Access to experimental features for beta testing program',
    environment: 'Staging',
    enabled: true,
    rolloutPercentage: 25,
    createdAt: '2024-01-08T14:10:00Z',
    updatedAt: '2024-01-23T09:40:00Z'
  }
];

type SortField = 'name' | 'createdAt';
type SortDirection = 'asc' | 'desc';

const FeatureFlags = () => {
  // State management
  const [flags, setFlags] = useState(initialFlags);
  const [searchTerm, setSearchTerm] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedFlag, setSelectedFlag] = useState<typeof initialFlags[0] | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toggleModalOpen, setToggleModalOpen] = useState(false);
  const [flagToToggle, setFlagToToggle] = useState<typeof initialFlags[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and sort logic
  const filteredAndSortedFlags = useMemo(() => {
    let filtered = flags.filter(flag => {
      const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flag.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEnvironment = environmentFilter === 'All' || flag.environment === environmentFilter;
      const matchesStatus = statusFilter === 'All' || 
                           (statusFilter === 'Enabled' && flag.enabled) ||
                           (statusFilter === 'Disabled' && !flag.enabled);
      
      return matchesSearch && matchesEnvironment && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortField === 'name') {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      }
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [flags, searchTerm, environmentFilter, statusFilter, sortField, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedFlags.length / itemsPerPage);
  const paginatedFlags = filteredAndSortedFlags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper functions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCopyFlagId = (flagId: string) => {
    navigator.clipboard.writeText(flagId);
    toast.success(`${flagId} has been copied to your clipboard.`);
  };

  const handleCreateFlag = (newFlag: typeof initialFlags[0]) => {
    setFlags(prev => [newFlag, ...prev]);
  };

  const handleToggleFlag = (flagId: string, enabled: boolean, reason: string) => {
    setFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { ...flag, enabled, updatedAt: new Date().toISOString() }
        : flag
    ));
    console.log(`Flag ${flagId} ${enabled ? 'enabled' : 'disabled'} with reason: ${reason}`);
  };

  const handleSwitchToggle = (flag: typeof initialFlags[0]) => {
    setFlagToToggle(flag);
    setToggleModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Description', 'Environment', 'Enabled', 'Rollout %', 'Created At'].join(','),
      ...filteredAndSortedFlags.map(flag => [
        flag.name,
        `"${flag.description}"`,
        flag.environment,
        flag.enabled.toString(),
        flag.rolloutPercentage.toString(),
        new Date(flag.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature-flags.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Feature flags data has been exported to CSV.');
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Feature Flags</h1>
            <p className="text-muted-foreground">
              Manage and monitor all your feature flags here.
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Flag
          </Button>
        </div>

        {/* Filters and Search Section */}
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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    aria-label="Search feature flags"
                  />
                </div>

                {/* Environment Filter */}
                <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Button onClick={handleExportCSV} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Showing {paginatedFlags.length} of {filteredAndSortedFlags.length} feature flags
        </div>

        {/* Feature Flags Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Name Column - Sortable */}
                <TableHead className="w-[200px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[120px]">Environment</TableHead>
                <TableHead className="w-[100px]">Enabled</TableHead>
                <TableHead className="w-[100px]">Rollout %</TableHead>
                {/* Created At Column - Sortable */}
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('createdAt')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Created At
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFlags.map((flag) => (
                <TableRow key={flag.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{flag.name}</TableCell>
                  <TableCell>
                    <span title={flag.description}>
                      {truncateText(flag.description, 60)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{flag.environment}</Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={() => handleSwitchToggle(flag)}
                      aria-label={`Toggle ${flag.name}`}
                    />
                  </TableCell>
                  <TableCell>{flag.rolloutPercentage}%</TableCell>
                  <TableCell>{formatDate(flag.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleCopyFlagId(flag.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Flag ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSelectedFlag(flag)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        {selectedFlag && (
          <FeatureFlagModal
            flag={selectedFlag}
            isOpen={!!selectedFlag}
            onClose={() => setSelectedFlag(null)}
          />
        )}

        <CreateFlagModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreateFlag={handleCreateFlag}
        />

        <ToggleFlagModal
          flag={flagToToggle}
          isOpen={toggleModalOpen}
          onClose={() => {
            setToggleModalOpen(false);
            setFlagToToggle(null);
          }}
          onToggleFlag={handleToggleFlag}
        />
      </div>
    </div>
  );
};

export default FeatureFlags;
