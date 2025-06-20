// components/FeatureFlagsTable.tsx
import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { FeatureFlag, SortField, SortDirection } from '@/types/flag';
import { truncateText, formatDate } from '@/utils/flag-helpers';

interface FeatureFlagsTableProps {
  flags: FeatureFlag[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onFlagToggle: (flag: FeatureFlag) => void;
  isTogglingFlagId?: string | null;
}

const FeatureFlagsTable: React.FC<FeatureFlagsTableProps> = ({
  flags,
  sortField,
  sortDirection,
  onSort,
  onFlagToggle,
  isTogglingFlagId,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">
            <Button
              variant="ghost"
              onClick={() => onSort('name')}
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Name
              {sortField === 'name' && (
                sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </Button>
          </TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Environment</TableHead>
          <TableHead>Enabled</TableHead>
          <TableHead>Rollout %</TableHead>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSort('createdAt')}
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Created At
              {sortField === 'createdAt' && (
                sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </Button>
          </TableHead>
          {/* Commented out the Actions column in the Feature Flags table */}
          {/* <TableHead>Actions</TableHead> */}
        </TableRow>
      </TableHeader>
      <TableBody>
        {flags.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No feature flags found matching your criteria.
            </TableCell>
          </TableRow>
        ) : (
          flags.map((flag) => (
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
                  onCheckedChange={() => onFlagToggle(flag)}
                  aria-label={`Toggle ${flag.name}`}
                  disabled={isTogglingFlagId === flag.id} // Disable switch while this flag is being toggled
                />
              </TableCell>
              <TableCell>{flag.rolloutPercentage}%</TableCell>
              <TableCell>{formatDate(flag.createdAt)}</TableCell>
              {/* Commented out the Actions cell in the table body */}
              {/* <TableCell>
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
                    <DropdownMenuItem onClick={() => onViewDetails(flag)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell> */}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default FeatureFlagsTable;