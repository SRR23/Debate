import prisma from '../lib/prisma';
import LeaderboardTable from '../components/LeaderboardTable';

export default async function Scoreboard({ searchParams }) {
  const filter = (await searchParams).filter || 'all';
  let dateFilter = {};

  // Apply date filter for Prisma query
  if (filter === 'weekly') {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    dateFilter = { votes: { some: { createdAt: { gte: oneWeekAgo } } } };
  } else if (filter === 'monthly') {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    dateFilter = { votes: { some: { createdAt: { gte: oneMonthAgo } } } };
  }

  // Fetch users with their arguments and votes
  const users = await prisma.user.findMany({
    include: {
      arguments: {
        include: {
          votes: {
            // Only include votes within the date range for weekly/monthly
            ...(filter !== 'all' ? { where: { createdAt: dateFilter.votes.some.createdAt } } : {}),
          },
        },
      },
      joinedDebates: true,
    },
    ...(filter !== 'all' ? { where: dateFilter } : {}),
  });

  // Calculate leaderboard data
  const leaderboard = users
    .map(user => ({
      name: user.name || 'Unknown', // Fallback for null names
      totalVotes: user.arguments.reduce((sum, arg) => sum + arg.votes.length, 0),
      debatesCount: user.joinedDebates.length,
    }))
    .filter(user => filter === 'all' || user.totalVotes > 0) // Only show users with votes for weekly/monthly
    .sort((a, b) => b.totalVotes - a.totalVotes);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <LeaderboardTable leaderboard={leaderboard} filter={filter} />
    </div>
  );
}