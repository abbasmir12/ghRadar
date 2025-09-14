import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
  const shimmer = {
    animate: {
      backgroundPosition: ['200% 0', '-200% 0'],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  };

  const SkeletonBox = ({ className }) => (
    <motion.div
      className={`bg-gradient-to-r from-dark-card via-gray-700 to-dark-card bg-[length:200%_100%] rounded-lg ${className}`}
      animate={shimmer.animate}
      transition={shimmer.transition}
      style={{
        backgroundImage: 'linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)',
      }}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Profile Card Skeleton */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          <SkeletonBox className="w-32 h-32 rounded-full" />
          
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <SkeletonBox className="h-8 w-64" />
              <SkeletonBox className="h-6 w-32" />
            </div>
            
            <SkeletonBox className="h-20 w-full" />
            
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <SkeletonBox className="h-8 w-full" />
                  <SkeletonBox className="h-4 w-full" />
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Repositories Skeleton */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <SkeletonBox className="h-8 w-48" />
            <SkeletonBox className="h-4 w-24" />
          </div>
          
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-dark-bg border border-dark-border rounded-xl p-4">
                <SkeletonBox className="h-6 w-3/4 mb-3" />
                <SkeletonBox className="h-4 w-full mb-3" />
                <div className="flex gap-4">
                  <SkeletonBox className="h-4 w-16" />
                  <SkeletonBox className="h-4 w-12" />
                  <SkeletonBox className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="space-y-6">
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <SkeletonBox className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-2 gap-4">
              <SkeletonBox className="h-24 w-full rounded-xl" />
              <SkeletonBox className="h-24 w-full rounded-xl" />
            </div>
          </div>
          
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
            <SkeletonBox className="h-6 w-40 mb-4" />
            <SkeletonBox className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingSkeleton;