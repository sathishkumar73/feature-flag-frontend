// components/FeatureFlagsList.tsx
import { Card } from "@/components/ui/card";
import { FeatureFlag } from "@/components/types/flag";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureFlagsListProps {
  loading: boolean;
  flags: FeatureFlag[];
}

const FeatureFlagsList: React.FC<FeatureFlagsListProps> = ({ loading, flags }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-[70%]" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[50%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (flags.length === 0) {
    return <div>No Feature Flags Found</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flags.map((flag: FeatureFlag) => (
        <Card key={flag.id} className="p-4">
          <h2 className="text-lg font-semibold">{flag.name}</h2>
          <p className="text-gray-500">{flag.description}</p>
          <p className="text-sm mt-2">
            Enabled: {flag.enabled ? "✅" : "❌"}
          </p>
          <p className="text-sm">Environment: {flag.environment}</p>
        </Card>
      ))}
    </div>
  );
};

export default FeatureFlagsList;