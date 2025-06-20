import { AlertTriangle } from "lucide-react";

export default function InvalidInvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 text-yellow-600 rounded-full p-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-2 text-foreground">This invite link is invalid or has been revoked</h1>
        <p className="text-sm text-muted-foreground mb-6">
          It looks like the invite token you used is no longer active. This could happen if it was already used or expired.
        </p>
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
