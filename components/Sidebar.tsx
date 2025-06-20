// components/app-sidebar.tsx
import Link from "next/link";
import { Sidebar } from "./ui/sidebar";
import { Key, ToggleRight, FileText, Rocket, FileBarChart } from "lucide-react";

export const AppSidebar = () => {
  return (
    <Sidebar className="w-64 bg-gray-100 border-r shadow-md z-50" collapsible="none" variant="sidebar">
      <div className="p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">
          <Rocket className="w-5 h-5 mr-2 inline-block" />
          GradualRollout
        </h2>
        <nav className="flex flex-col gap-4">
          <Link
            href="/flags"
            className="flex items-center gap-2 py-3 px-4 rounded-md transition duration-200 font-medium border-l-4 border-transparent hover:border-gray-400 hover:bg-gray-200 text-black"
          >
            <ToggleRight className="w-5 h-5" />
            Feature Flags
          </Link>
          <Link
            href="/audit-logs"
            className="flex items-center gap-2 py-3 px-4 rounded-md transition duration-200 font-medium border-l-4 border-transparent hover:border-gray-400 hover:bg-gray-200 text-black"
          >
            <FileBarChart className="w-5 h-5" />
            Audit Logs
          </Link>
          <Link
            href="/documentation"
            className="flex items-center gap-2 py-3 px-4 rounded-md transition duration-200 font-medium border-l-4 border-transparent hover:border-gray-400 hover:bg-gray-200 text-black"
            id="documentation-link"
          >
            <FileText className="w-5 h-5" />
            Documentation
          </Link>
          <Link
            href="/api-key"
            className="flex items-center gap-2 py-3 px-4 rounded-md transition duration-200 font-medium border-l-4 border-transparent hover:border-gray-400 hover:bg-gray-200 text-black"
            id="api-key-link"
          >
            <Key className="w-5 h-5" />
            API Keys
          </Link>
        </nav>
      </div>
    </Sidebar>
  );
};
