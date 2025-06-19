"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WaitListSignup } from "@/hooks/useWaitlist";

type WaitListStatus = "APPROVED" | "PENDING" | "REVOKED";

interface WaitlistTableProps {
  data: WaitListSignup[];
  loading: boolean;
  error: string | null;
}

const STATUS_OPTIONS: WaitListStatus[] = ["APPROVED", "PENDING", "REVOKED"];
const STATUS_COLORS: Record<WaitListStatus, string> = {
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  REVOKED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function WaitlistTable({ data, loading, error }: WaitlistTableProps) {
  const [dialog, setDialog] = React.useState<{
    open: boolean;
    user?: WaitListSignup;
    newStatus?: WaitListStatus;
  }>({ open: false });

  // For demo, status change is local only. In real app, call backend here.
  const [localData, setLocalData] = React.useState<WaitListSignup[]>(data);
  React.useEffect(() => { setLocalData(data); }, [data]);

  const handleStatusChange = (user: WaitListSignup, newStatus: WaitListStatus) => {
    setDialog({ open: true, user, newStatus });
  };

  const confirmStatusChange = () => {
    if (dialog.user && dialog.newStatus) {
      setLocalData((prev) =>
        prev.map((u) =>
          u.id === dialog.user!.id ? { ...u, status: dialog.newStatus! } : u
        )
      );
      // TODO: Call backend to persist status change
    }
    setDialog({ open: false });
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="py-8 text-center text-destructive">{error}</div>;
  if (!localData.length) return <div className="py-8 text-center text-muted-foreground">No users on the waitlist.</div>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Challenges</TableHead>
            <TableHead>Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localData.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  value={user.status}
                  onValueChange={(v) => handleStatusChange(user, v as WaitListStatus)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${STATUS_COLORS[status]}`}>{status}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{user.company || "-"}</TableCell>
              <TableCell>{user.role || "-"}</TableCell>
              <TableCell>{user.challenges || "-"}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change status for <b>{dialog.user?.name}</b> to <b>{dialog.newStatus}</b>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
            <Button onClick={confirmStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
