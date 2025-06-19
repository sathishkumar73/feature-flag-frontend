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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WaitListSignup } from "@/hooks/useWaitlist";

type WaitListStatus = "APPROVED" | "PENDING" | "REVOKED";

interface WaitlistTableProps {
  data: WaitListSignup[];
  error: string | null;
}

const STATUS_OPTIONS: WaitListStatus[] = ["APPROVED", "PENDING", "REVOKED"];
const STATUS_COLORS: Record<WaitListStatus, string> = {
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  REVOKED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function WaitlistTable({ data, error }: Omit<WaitlistTableProps, 'loading'>) {
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

  return (
    <>
      {error && (
        <div className="py-8 text-center text-destructive">{error}</div>
      )}
      {!error && !localData.length && (
        <div className="py-8 text-center text-muted-foreground">No users on the waitlist.</div>
      )}
      {!error && localData.length > 0 && (
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
                <DialogTitle>
                  {dialog.newStatus === "REVOKED"
                    ? "Revoke Waitlist User?"
                    : dialog.newStatus === "APPROVED"
                    ? "Approve Waitlist User?"
                    : "Mark as Pending?"}
                </DialogTitle>
                <DialogDescription>
                  <span
                    className={
                      dialog.newStatus === "REVOKED"
                        ? "text-destructive"
                        : dialog.newStatus === "APPROVED"
                        ? "text-green-700 dark:text-green-400"
                        : "text-yellow-700 dark:text-yellow-400"
                    }
                  >
                    {dialog.newStatus === "REVOKED"
                      ? (<>
                          Are you sure you want to <b>revoke</b> <b>{dialog.user?.name}</b>? This action is <b>destructive</b> and will remove their access to early features.
                        </>)
                      : dialog.newStatus === "APPROVED"
                      ? (<>
                          Approve <b>{dialog.user?.name}</b> for early access? They will be notified and can use new features.
                        </>)
                      : (<>
                          Mark <b>{dialog.user?.name}</b> as <b>pending</b>? They will remain on the waitlist.
                        </>)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog({ open: false })}>Cancel</Button>
                <Button onClick={confirmStatusChange} variant={dialog.newStatus === "REVOKED" ? "destructive" : "default"}>
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  );
}
