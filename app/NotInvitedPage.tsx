import { AlertTriangle } from "lucide-react";

export default function NotInvitedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 text-yellow-600 rounded-full p-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Looks like you’re not on the guest list yet.</h1>
        <p className="text-sm text-muted-foreground mb-6">
          GradualRollout is currently in beta.<br />
          Join the waitlist and we’ll send you an invite soon!
        </p>
        <a
          href="https://gradualrollout.com"
          className="inline-block mt-2 mb-4 px-4 py-2 rounded bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Register here
        </a>
        <p className="text-xs text-gray-400 mt-6">
          Need help?{' '}
          <a
            href="https://x.com/sathish_hsihtas"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
