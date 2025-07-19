import prisma from '../lib/prisma';
import LeaderboardTable from '../components/LeaderboardTable';
import { Suspense } from 'react';
import LeaderboardSkeleton from '../skeleton/LeaderboardSkeleton';

// Revalidate every 10 minutes
export const revalidate = 600;


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