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
import { FeatureFlagsListProps } from "../types/flag-list-props";

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
    cell: ({ row }) => (row.getValue("enabled") ? "✅" : "❌"),
  },
  {
    accessorKey: "environment",
    header: "Environment",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.id} {/* Placeholder for actions */}
      </div>
    ),
    enableSorting: false,
  },
];

// Define skeleton columns (headers remain the same)
const skeletonColumns: ColumnDef<FeatureFlag>[] = columns.map((column) => ({
  ...column,
  cell: () => <Skeleton className="h-4 w-full" />,
}));

const FeatureFlagsList: React.FC<FeatureFlagsListProps> = ({
  loading,
  flags,
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
  const columnsToUse = loading ? skeletonColumns : columns;

  const table = useReactTable({
    data,
    columns: columnsToUse as ColumnDef<FeatureFlag>[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
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
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No Feature Flags Found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};

export default FeatureFlagsList;
