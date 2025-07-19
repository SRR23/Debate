"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import Image from 'next/image';

export default function DebateCard({ debate }) {

  // Fallback image URL for when debate.image is invalid or missing
  const fallbackImage = '/images/next.svg';

  // Check if the debate has expired based on endsAt or status
  const isDebateExpired = debate.status !== 'active' || (debate.endsAt && new Date(debate.endsAt) < new Date());



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        {debate.image ? (
          <Image
            src={debate.image}
            alt={debate.title}
            width={640}
            height={240}
            className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.src = fallbackImage;
            }}
            placeholder="blur"
            blurDataURL="/images/placeholder.jpg"
          />
        ) : (
          <div className="w-full h-60 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">No image available</span>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isDebateExpired ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              Debate Over
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Active
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 backdrop-blur-sm">
            {debate.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {debate.title}
        </h2>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
          {debate.description}
        </p>

        {/* Owner Name */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Created by: <span className="font-medium text-gray-700 dark:text-gray-200">{debate.creator.name || 'Anonymous'}</span>
        </p>

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {debate.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
            {debate.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                +{debate.tags.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/debates/${debate.id}`} className="block">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 shadow-md hover:shadow-lg"
          >
            View Debate
          </motion.button>
        </Link>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
}

DebateCard.propTypes = {
  debate: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    image: PropTypes.string,
    status: PropTypes.string.isRequired,
    endsAt: PropTypes.string,
    ownerName: PropTypes.string,
  }).isRequired,
};