"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import Image from 'next/image'; // Use Next.js Image component for optimization

export default function DebateCard({ debate }) {
  // Fallback image URL for when debate.imageUrl is invalid or missing
  const fallbackImage = '/images/fallback.jpg'; // Replace with your fallback image path

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <h2 className="text-xl font-bold">{debate.title}</h2>
      <p className="text-gray-600 dark:text-gray-300">{debate.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Category: {debate.category}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Tags: {debate.tags.join(', ')}</p>
      {debate.imageUrl ? (
        <Image
          src={debate.imageUrl}
          alt={debate.title}
          width={640} // Adjust based on your design
          height={192} // Matches h-48 (48 * 4 = 192px)
          className="w-full h-48 object-cover rounded mb-2"
          onError={(e) => {
            e.target.src = fallbackImage; // Fallback on error
          }}
          placeholder="blur"
          blurDataURL="/images/placeholder.jpg" // Optional: low-res placeholder image
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">No image available</span>
        </div>
      )}
      <Link href={`/debates/${debate.id}`}>
        <button className="mt-2 py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          View Debate
        </button>
      </Link>
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
    imageUrl: PropTypes.string,
  }).isRequired,
};