'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { fetchFlags } from '@/services/flagService';


export default function FlagsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlags()
      .then(data => setFlags(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-10">Loading Flags...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Flags</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flags.map((flag: any) => (
          <Card key={flag.id} className="p-4">
            <h2 className="text-lg font-semibold">{flag.name}</h2>
            <p className="text-gray-500">{flag.description}</p>
            <p className="text-sm mt-2">Enabled: {flag.enabled ? '✅' : '❌'}</p>
            <p className="text-sm">Environment: {flag.environment}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
