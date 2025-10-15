import React from 'react';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';

const AnalysisSkeleton: React.FC = () => {
    return (
        <Card className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4"><Skeleton className="h-8 w-3/4" /></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2"><Skeleton className="h-6 w-32" /></h3>
                    <Skeleton className="w-32 h-32 rounded-full" />
                </div>
                <div className="md:col-span-2 p-4 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-2"><Skeleton className="h-6 w-24" /></h3>
                        <Skeleton className="h-8 w-40" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mt-4 mb-2"><Skeleton className="h-6 w-48" /></h3>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2"><Skeleton className="h-6 w-40" /></h3>
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="w-3/4 space-y-2">
                                    <Skeleton className="h-5 w-1/2" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default AnalysisSkeleton;
