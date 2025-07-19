"use client";

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeaderboardTable({ leaderboard, filter }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (newFilter) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex justify-end p-4">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border dark:border-gray-600 rounded-l-lg ${
              filter === 'weekly'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleFilterChange('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border-t border-b dark:border-gray-600 ${
              filter === 'monthly'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleFilterChange('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium border dark:border-gray-600 rounded-r-lg ${
              filter === 'all'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => handleFilterChange('all')}
          >
            All Time
          </button>
        </div>
      </div>
      {leaderboard.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No data available for the last week/month.
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-2">Rank</th>
              <th className="p-2">User</th>
              <th className="p-2">Total Votes</th>
              <th className="p-2">Debates Joined</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <motion.tr
                key={user.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border-t dark:border-gray-600"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{user.name}</td>
                <td className="p-2">{user.totalVotes}</td>
                <td className="p-2">{user.debatesCount}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}