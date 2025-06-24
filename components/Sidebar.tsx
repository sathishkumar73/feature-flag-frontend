// components/app-sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./ui/sidebar";
import { Key, ToggleRight, FileText, Rocket, FileBarChart, Bird } from "lucide-react";

export const AppSidebar = () => {
  const pathname = usePathname();
  return (
    <Sidebar className="w-64 bg-gray-100 border-r shadow-md z-50" variant="sidebar">
      <div className="p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">
          <Rocket className="w-5 h-5 mr-2 inline-block" />
          GradualRollout
        </h2>
        <nav className="flex flex-col gap-4">
          <Link
            href="/flags"
            className={`flex items-center gap-2 py-3 px-4 rounded-[20px] transition duration-200 font-medium border-l-4 hover:border-gray-400 hover:bg-gray-200 text-black ${pathname.startsWith('/flags') ? 'bg-[#e9ebee] font-semibold shadow-none border-transparent' : 'border-transparent'}`}
          >
            <ToggleRight className="w-5 h-5" />
            Feature Flags
          </Link>
          <Link
            href="/audit-logs"
            className={`flex items-center gap-2 py-3 px-4 rounded-[20px] transition duration-200 font-medium border-l-4 hover:border-gray-400 hover1:bg-gray-200 text-black ${pathname.startsWith('/audit-logs') ? 'bg-[#e9ebee] font-semibold shadow-none border-transparent' : 'border-transparent'}`}
          >
            <FileBarChart className="w-5 h-5" />
            Audit Logs
          </Link>
          <Link
            href="/canary-deployment"
            className={`flex items-center gap-2 py-3 px-4 rounded-[20px] transition duration-200 font-medium border-l-4 hover:border-gray-400 hover:bg-gray-200 text-black ${pathname.startsWith('/canary-deployment') ? 'bg-[#e9ebee] font-semibold shadow-none border-transparent' : 'border-transparent'}`}
          >
            <Bird className="w-5 h-5" />
            Canary
          </Link>
          <Link
            href="/documentation"
            className={`flex items-center gap-2 py-3 px-4 rounded-[20px] transition duration-200 font-medium border-l-4 hover:border-gray-400 hover:bg-gray-200 text-black ${pathname.startsWith('/documentation') ? 'bg-[#e9ebee] font-semibold shadow-none border-transparent' : 'border-transparent'}`}
            id="documentation-link"
          >
            <FileText className="w-5 h-5" />
            Documentation
          </Link>
          <Link
            href="/api-key"
            className={`flex items-center gap-2 py-3 px-4 rounded-[20px] transition duration-200 font-medium border-l-4 hover:border-gray-400 hover:bg-gray-200 text-black ${pathname.startsWith('/api-key') ? 'bg-[#e9ebee] font-semibold shadow-none border-transparent' : 'border-transparent'}`}
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
