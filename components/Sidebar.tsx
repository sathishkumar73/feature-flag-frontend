// components/app-sidebar.tsx
import Link from "next/link";
import { Sidebar } from "./ui/sidebar";
import { Key, ToggleRight, FileText, Rocket } from "lucide-react";

export const AppSidebar = () => {
  return (
    <Sidebar className="w-64 bg-gray-100 border-r shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">
          <Rocket className="w-5 h-5 mr-2 inline-block" />
          GradualRollout
        </h2>
        <nav className="space-y-4">
          <Link
            href="/flags"
            className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-200 hover:text-blue-600 transition duration-200"
          >
            <ToggleRight className="w-5 h-5" />
            Feature Flags
          </Link>
          <Link
            href="/audit-logs"
            className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-200 hover:text-blue-600 transition duration-200"
          >
            <FileText className="w-5 h-5" />
            Audit Logs
          </Link>
          <Link
            href="/api-key"
            className="flex items-center gap-2 py-2 px-4 rounded-md hover:bg-gray-200 hover:text-blue-600 transition duration-200"
          >
            <Key className="w-5 h-5" />
            API Keys
          </Link>
        </nav>
      </div>
    </Sidebar>
  );
};
