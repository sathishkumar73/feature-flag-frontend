import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function InviteTokenChecking() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <motion.div
        className="max-w-md w-full text-center border border-border bg-card shadow-xl rounded-2xl p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-4">
          <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
        </div>

        <h2 className="text-lg font-semibold text-foreground mb-2">
          Verifying your invite token...
        </h2>

        <p className="text-muted-foreground text-sm mb-6">
          Hang tight! We&apos;re checking your invitation status. <br />
          This only takes a second.
        </p>

        <div className="flex justify-center">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        </div>
      </motion.div>
    </div>
  );
}
