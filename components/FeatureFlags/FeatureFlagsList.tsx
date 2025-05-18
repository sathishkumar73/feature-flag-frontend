// components/FeatureFlagsList.tsx
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FeatureFlag } from "@/components/types/flag";
import { FeatureFlagsListProps } from "@/components/types/flag-list-props";
import { Button } from "../ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

const FeatureFlagsList: React.FC<FeatureFlagsListProps> = ({
  loading,
  flags,
  onEdit,
  onDelete,
}) => {
  const data: FeatureFlag[] = loading
    ? Array.from({ length: 10 }, (_, index) => ({
        id: String(index),
        name: "Loading...",
        description: "Loading...",
        enabled: false,
        environment: "loading",
        createdAt: new Date(),
        updatedAt: new Date(),
        rolloutPercentage: 0,
        version: 1,
      }))
    : flags;

  const columns: ColumnDef<FeatureFlag>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "enabled",
      header: "Enabled",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.getValue("enabled") ? (
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XCircleIcon className="h-4 w-4 text-red-500" />
          )}
          <span className="ml-2 sr-only">
            {row.getValue("enabled") ? "Enabled" : "Disabled"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "environment",
      header: "Environment",
    },
    {
      accessorKey: "rolloutPercentage",
      header: "Rollout %",
      cell: ({ row }) => row.getValue("rolloutPercentage") + "%",
    },
    {
      accessorKey: "version",
      header: "Version",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8"
          >
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original)}
            className="h-8 w-8"
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  // Define skeleton columns (headers remain the same)
  const skeletonColumns: ColumnDef<FeatureFlag>[] = columns.map((column) => ({
    ...column,
    cell: () => <Skeleton className="h-6 w-full" />,
  }));
  const columnsToUse = loading ? skeletonColumns : columns;

  const table = useReactTable({
    data,
    columns: columnsToUse as ColumnDef<FeatureFlag>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-md border max-h-[500px] overflow-y-scroll">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-2">
                  {" "}
                  {/* Added padding */}
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-12"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {" "}
                    {/* Added padding */}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center py-3"
              >
                No Feature Flags Found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};

const areEqual = (
  prevProps: FeatureFlagsListProps,
  nextProps: FeatureFlagsListProps
) => {
  // If loading state changes but flags are the same reference, don't re-render
  if (
    prevProps.loading !== nextProps.loading &&
    prevProps.flags === nextProps.flags
  ) {
    return true;
  }
  // Otherwise, perform a shallow comparison of all props
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.flags === nextProps.flags &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  );
};

export default React.memo(FeatureFlagsList, areEqual);
