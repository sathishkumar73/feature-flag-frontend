import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-6 shadow-md">
      <h2 className="text-xl font-bold mb-6">Feature Flags</h2>
      <nav className="space-y-4">
        <Link href="/flags" className="block hover:text-blue-600">Dashboard</Link>
        <Link href="/audit-logs" className="block hover:text-blue-600">Audit Logs</Link>
      </nav>
    </aside>
  );
}
