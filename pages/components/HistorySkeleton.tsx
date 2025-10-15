import React from 'react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';

const HistoryItemSkeleton: React.FC = () => (
    <Card className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            <div className="flex justify-center items-center">
                <Skeleton className="w-32 h-32 rounded-lg" />
            </div>
            <div className="md:col-span-3">
                <div className="flex justify-between items-start mb-2">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <Skeleton className="h-5 w-40" />
            </div>
        </div>
    </Card>
);

const HistorySkeleton: React.FC<{ count: number }> = ({ count }) => {
    return (
        <div>
            {[...Array(count)].map((_, i) => (
                <HistoryItemSkeleton key={i} />
            ))}
        </div>
    );
};

export default HistorySkeleton;
