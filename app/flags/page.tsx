"use client";
import CreateFlagDialog from "@/components/CreateFlagDialog";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { fetchFlags } from "@/services/flagService";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  environment: string;
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [environment, setEnvironment] = useState("all");
  const [sortOrder, setSortOrder] = useState("createdAt_desc");

  useEffect(() => {
    setLoading(true);
    fetchFlags(page, limit, environment, sortOrder)
      .then((data) => setFlags(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, limit, environment, sortOrder]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <div className="text-center mt-10">Loading Flags...</div>;

  if (flags.length === 0) return <div>No Feature Flags Found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Flags</h1>
      <div className="flex gap-4 mb-4">
        {/* Environment Filter */}
        <Select
          onValueChange={(value) => setEnvironment(value)}
          defaultValue="all"
        >
          <SelectTrigger className="w-[180px]">Environment</SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="development">Development</SelectItem>
          </SelectContent>
        </Select>

        {/* Sorting */}
        <Select
          onValueChange={(value) => setSortOrder(value)}
          defaultValue="createdAt_desc"
        >
          <SelectTrigger className="w-[180px]">Sort By</SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt_desc">Newest First</SelectItem>
            <SelectItem value="createdAt_asc">Oldest First</SelectItem>
            <SelectItem value="name_asc">Name (A-Z)</SelectItem>
            <SelectItem value="name_desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CreateFlagDialog
        className="mb-4"
        onFlagCreated={() => {
          fetchFlags().then(setFlags);
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flags.map((flag: FeatureFlag) => (
          <Card key={flag.id} className="p-4">
            <h2 className="text-lg font-semibold">{flag.name}</h2>
            <p className="text-gray-500">{flag.description}</p>
            <p className="text-sm mt-2">
              Enabled: {flag.enabled ? "✅" : "❌"}
            </p>
            <p className="text-sm">Environment: {flag.environment}</p>
          </Card>
        ))}
      </div>

      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) handlePageChange(page - 1);
              }}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  href="#"
                  isActive={pageNumber === page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(pageNumber);
                  }}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page + 1);
              }}
              aria-disabled={page === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
