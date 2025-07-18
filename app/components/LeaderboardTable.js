"use client";

import { motion } from 'framer-motion';

export default function LeaderboardTable({ leaderboard }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
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
    </div>
  );
}