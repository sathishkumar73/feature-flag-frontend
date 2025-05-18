// components/FeatureFlagsPagination.tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface FeatureFlagsPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const FeatureFlagsPagination: React.FC<FeatureFlagsPaginationProps> = ({ page, totalPages, onPageChange }) => {
  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
          />
        </PaginationItem>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <PaginationItem key={pageNumber}>
            <PaginationLink
              href="#"
              isActive={pageNumber === page}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(pageNumber);
              }}
            >
              {pageNumber}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page + 1);
            }}
            aria-disabled={page === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default FeatureFlagsPagination;