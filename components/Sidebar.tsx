// components/app-sidebar.tsx
import Link from 'next/link';
import { Sidebar } from './ui/sidebar';

export const AppSidebar = () => {
  return (
    <Sidebar className="w-64 bg-gray-100 border-r shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Feature Flags</h2>
        <nav className="space-y-4">
          <Link href="/flags" className="block py-2 px-4 rounded-md hover:bg-gray-200 hover:text-blue-600 transition duration-200">
            Feature Flags
          </Link>
          <Link href="/audit-logs" className="block py-2 px-4 rounded-md hover:bg-gray-200 hover:text-blue-600 transition duration-200">
            Audit Logs
          </Link>
        </nav>
      </div>
    </Sidebar>
  );
};