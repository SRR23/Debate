"use client";

import { motion } from 'framer-motion';

export default function DebateCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
    >
      {/* Image Skeleton */}
      <div className="relative overflow-hidden">
        <div className="w-full h-60 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        
        {/* Status Badge Skeleton */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 w-20 h-6 animate-pulse" />
        </div>

        {/* Category Badge Skeleton */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 w-16 h-6 animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse" />

        {/* Description Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </div>

        {/* Owner Name Skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4 animate-pulse" />

        {/* Tags Skeleton */}
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse" />
        </div>

        {/* Action Button Skeleton */}
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full animate-pulse" />
      </div>
    </motion.div>
  );
}