import React from 'react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';

const RecommendationCardSkeleton: React.FC = () => (
    <Card className="flex flex-col">
        <Skeleton className="w-full h-40" />
        <div className="p-4 flex flex-col flex-grow space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex-grow space-y-2 pt-2">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>
        </div>
    </Card>
);

const RecommendationsSkeleton: React.FC<{ count: number }> = ({ count }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(count)].map((_, i) => (
                <RecommendationCardSkeleton key={i} />
            ))}
        </div>
    );
};

export default RecommendationsSkeleton;
