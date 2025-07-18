import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { argumentId, userId } = await req.json();

  const existingVote = await prisma.vote.findFirst({
    where: { argumentId, userId },
  });

  if (existingVote) {
    return new Response(JSON.stringify({ error: 'You have already voted' }), { status: 400 });
  }

  try {
    await prisma.$transaction([
      prisma.vote.create({
        data: {
          argumentId,
          userId,
        },
      }),
      prisma.argument.update({
        where: { id: argumentId },
        data: { voteCount: { increment: 1 } },
      }),
    ]);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to vote' }), { status: 500 });
  }
}