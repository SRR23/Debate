import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DebateCard({ debate }) {
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
      <Link href={`/debates/${debate.id}`}>
        <button className="mt-2 py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          View Debate
        </button>
      </Link>
    </motion.div>
  );
}