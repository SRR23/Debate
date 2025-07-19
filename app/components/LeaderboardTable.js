"use client";
import { motion, useReducedMotion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LeaderboardTable({ leaderboard, filter }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  const handleFilterChange = (newFilter) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <span className="text-yellow-500 text-lg">🏆</span>;
    if (rank === 2) return <span className="text-gray-400 text-lg">🥈</span>;
    if (rank === 3) return <span className="text-amber-600 text-lg">🥉</span>;
    return null;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-l-4 border-yellow-400";
    if (rank === 2) return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 border-l-4 border-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-l-4 border-amber-600";
    return "hover:bg-gray-50 dark:hover:bg-gray-800/50";
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
              <p className="text-indigo-100 text-sm">Top debaters by performance</p>
            </div>
          </div>
          <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === 'weekly'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleFilterChange('weekly')}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === 'monthly'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleFilterChange('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-white text-indigo-600 shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { duration: 0.3 }}
          className="p-12 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-4xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-gray-400">
            No debate activity found for the selected time period.
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Debater
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-blue-600 dark:text-blue-400">📊</span>
                    <span>Total Votes</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-green-600 dark:text-green-400">💬</span>
                    <span>Debates</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((user, index) => (
                <motion.tr
                  key={user.name}
                  initial={shouldReduceMotion ? {} : { opacity: 0 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1 }}
                  transition={shouldReduceMotion ? {} : { duration: 0.2 }}
                  className={`transition-colors duration-200 ${getRankStyle(index + 1)}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(index + 1)}
                      <span
                        className={`text-lg font-bold ${
                          index + 1 <= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">{user.name}</div>
                        {index + 1 <= 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {index + 1 === 1 ? 'Champion' : index + 1 === 2 ? 'Runner-up' : 'Third Place'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                      <span className="text-lg font-bold">{user.totalVotes.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                      <span className="text-lg font-bold">{user.debatesCount}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}