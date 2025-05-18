// components/FeatureFlagsFilters.tsx
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FeatureFlagsFiltersProps } from "../types/flag-list-props";

const FeatureFlagsFilters: React.FC<FeatureFlagsFiltersProps> = ({
  environment,
  onEnvironmentChange,
  sortOrder,
  onSortOrderChange,
}) => {
  return (
    <div className="flex gap-4 mb-4">
      {/* Environment Filter */}
      <Select onValueChange={onEnvironmentChange} defaultValue="all" value={environment}>
        <SelectTrigger className="w-[180px]">
          {environment === "all"
            ? "All"
            : environment === "production"
            ? "Production"
            : environment === "staging"
            ? "Staging"
            : environment === "development"
            ? "Development"
            : "Select Environment"}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="production">Production</SelectItem>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="development">Development</SelectItem>
        </SelectContent>
      </Select>

      {/* Sorting */}
      <Select onValueChange={onSortOrderChange} defaultValue="createdAt_desc" value={sortOrder}>
        <SelectTrigger className="w-[180px]">
          {sortOrder === "createdAt_desc"
            ? "Newest First"
            : sortOrder === "createdAt_asc"
            ? "Oldest First"
            : sortOrder === "name_asc"
            ? "Name (A-Z)"
            : sortOrder === "name_desc"
            ? "Name (Z-A)"
            : "Select an option"}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt_desc">Newest First</SelectItem>
          <SelectItem value="createdAt_asc">Oldest First</SelectItem>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          <SelectItem value="name_desc">Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FeatureFlagsFilters;