import prisma from '../lib/prisma'; // Adjust the import path as necessary
import LeaderboardTable from '../components/LeaderboardTable';
export default async function Scoreboard() {
  const users = await prisma.user.findMany({
    include: {
      arguments: { include: { votes: true } },
      joinedDebates: true,
    },
  });

  const leaderboard = users.map(user => ({
    name: user.name,
    totalVotes: user.arguments.reduce((sum, arg) => sum + arg.votes.length, 0),
    debatesCount: user.joinedDebates.length,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <LeaderboardTable leaderboard={leaderboard} />
    </div>
  );
}