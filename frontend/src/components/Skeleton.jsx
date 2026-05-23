export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />
);

export const ProductSkeleton = () => (
  <div className="rounded-2xl bg-white dark:bg-gray-800 p-3 shadow-sm">
    <Skeleton className="h-32 w-full rounded-xl" />
    <Skeleton className="mt-3 h-4 w-3/4" />
    <Skeleton className="mt-2 h-3 w-1/2" />
    <Skeleton className="mt-3 h-8 w-full rounded-lg" />
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-2">
    <Skeleton className="h-16 w-16 rounded-full" />
    <Skeleton className="h-3 w-14" />
  </div>
);
