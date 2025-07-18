import prisma from './prisma';

export async function closeExpiredDebates() {
  const debates = await prisma.debate.findMany({
    where: { status: 'active', endsAt: { lte: new Date() } },
    include: { arguments: true },
  });

  for (const debate of debates) {
    const supportVotes = debate.arguments
      .filter(arg => arg.side === 'support')
      .reduce((sum, arg) => sum + arg.voteCount, 0);
    const opposeVotes = debate.arguments
      .filter(arg => arg.side === 'oppose')
      .reduce((sum, arg) => sum + arg.voteCount, 0);

    const winner = supportVotes > opposeVotes ? 'support' : opposeVotes > supportVotes ? 'oppose' : null;

    await prisma.debate.update({
      where: { id: debate.id },
      data: { status: 'closed', winner },
    });
  }
}