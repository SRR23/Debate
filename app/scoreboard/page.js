import prisma from '../lib/prisma';
import LeaderboardTable from '../components/LeaderboardTable';
import { Suspense } from 'react';

// Revalidate every 10 minutes
export const revalidate = 600;

function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto py-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/4"></div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2"></div>
              </div>
            </div>
            <div className="inline-flex bg-white/10 rounded-xl p-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-1"></div>
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></th>
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></th>
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></th>
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b">
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default async function Scoreboard({ searchParams }) {
  const filter = (await searchParams).filter || 'all';
  let dateFilter = {};

  if (filter === 'weekly') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    dateFilter = { votes: { some: { createdAt: { gte: oneWeekAgo } } } };
  } else if (filter === 'monthly') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter = { votes: { some: { createdAt: { gte: oneMonthAgo } } } };
  }

  // Optimized Prisma query
  const users = await prisma.user.findMany({
    select: {
      name: true,
      arguments: {
        select: {
          _count: {
            select: { votes: true },
          },
        },
        ...(filter !== 'all' ? { where: { votes: { some: { createdAt: dateFilter.votes.some.createdAt } } } } : {}),
      },
      joinedDebates: {
        select: { id: true },
      },
    },
    ...(filter !== 'all' ? { where: dateFilter } : {}),
  });

  const leaderboard = users
    .map(user => ({
      name: user.name || 'Unknown',
      totalVotes: user.arguments.reduce((sum, arg) => sum + arg._count.votes, 0),
      debatesCount: user.joinedDebates.length,
    }))
    .filter(user => filter === 'all' || user.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardTable leaderboard={leaderboard} filter={filter} />
      </Suspense>
    </div>
  );
}