"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
import { AuditLog, AuditLogsTableProps } from "@/components/types/audit-log";

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ loading, auditLogs }) => {
  const [expandedDetails, setExpandedDetails] = React.useState<{ [id: string]: boolean }>({});

  const toggleDetails = (id: string) => {
    setExpandedDetails((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
    },
    {
      accessorKey: "performedBy",
      header: "User",
    },
    {
      accessorKey: "action",
      header: "Action",
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => {
        const details = JSON.stringify(row.getValue("details"));
        const isExpanded = expandedDetails[row.original.id];
        const truncatedDetails =
          details && details.length > 100 ? `${details.substring(0, 100)}... (Click to expand)` : details;

        return (
          <div
            className="cursor-pointer w-full"
            onClick={() => toggleDetails(row.original.id)}
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {isExpanded ? (
              <textarea
                readOnly
                value={details || ""}
                className="w-full h-[200px] overflow-visible border rounded p-2"
                style={{ minHeight: '100px' }}
              />
            ) : (
              truncatedDetails
            )}
          </div>
        );
      },
    },
  ];

  const skeletonColumns: ColumnDef<AuditLog>[] = columns.map((column) => ({
    ...column,
    cell: () => <Skeleton className="h-6 w-full" />,
  }));
  const columnsToUse = loading ? skeletonColumns : columns;

  const table = useReactTable({
    data: loading
      ? Array.from({ length: 5 }, (_, index) => ({ id: String(index) } as AuditLog))
      : auditLogs,
    columns: columnsToUse as ColumnDef<AuditLog>[],
    getCoreRowModel: getCoreRowModel(),
  });

  const numColumns = columnsToUse.length;
  const gridTemplateColumns = `1fr 1fr 1fr 2fr`;


  return (
    <div className="rounded-md border max-h-[500px]">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} style={{ display: 'grid', gridTemplateColumns }}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
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
                key={row.original.id}
                data-state={row.getIsSelected() && "selected"}
                style={{ display: 'grid', gridTemplateColumns, height: expandedDetails[row.original.id] ? 'auto' : 'inherit' }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3" style={{ display: 'flex', alignItems: 'flex-start' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : !loading ? (
            <TableRow style={{ display: 'grid', gridTemplateColumns }}>
              <TableCell
                colSpan={numColumns}
                className="h-24 text-center py-3"
                style={{ display: 'flex', justifyContent: 'center' }}
              >
                No Audit Logs Found
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};

const areEqual = (prevProps: AuditLogsTableProps, nextProps: AuditLogsTableProps) => {
  if (
    prevProps.loading !== nextProps.loading &&
    prevProps.auditLogs === nextProps.auditLogs
  ) {
    return true;
  }
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.auditLogs === nextProps.auditLogs
  );
};

export default React.memo(AuditLogsTable, areEqual);