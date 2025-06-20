import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ValidInvitePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-8 text-center border border-gray-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 text-green-600 rounded-full p-4">
            <PartyPopper className="h-8 w-8" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          You&apos;re officially invited to GradualRollout 🎉
        </h1>

        <p className="text-muted-foreground text-sm mb-6">
          We&apos;re so grateful to have you on board!<br />
          Your trust means a lot. This beta wouldn&apos;t be possible without amazing folks like you.
        </p>

        <Button
          className="w-full"
          onClick={() => router.push("/auth/signup?invite=accepted")}
        >
          Begin Your Journey 🚀
        </Button>

        <p className="text-xs text-gray-400 mt-4">
          Need help?{' '}
          <a
            href="https://x.com/sathish_hsihtas"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us anytime
          </a>
        </p>
      </motion.div>
    </div>
  );
}
