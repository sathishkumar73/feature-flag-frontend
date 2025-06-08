"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiKey } from '@/components/types/api-key';
import { formatDate } from '@/components/types/api-key.helpers';

interface ApiKeyHistoryTableProps {
  keyHistory: ApiKey[];
}

const ApiKeyHistoryTable: React.FC<ApiKeyHistoryTableProps> = ({ keyHistory }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key History</CardTitle>
        <CardDescription>Previous API keys and their status</CardDescription>
      </CardHeader>
      <CardContent>
        {keyHistory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Revoked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keyHistory.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono text-sm">{key.partialKey}</TableCell>
                  <TableCell>
                    <Badge variant={key.status === "active" ? "default" : "secondary"}>
                      {key.status === "active" ? "Active" : "Revoked"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(key.createdAt)}</TableCell>
                  <TableCell className="text-sm">{key.revokedAt ? formatDate(key.revokedAt) : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No API key history available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeyHistoryTable;