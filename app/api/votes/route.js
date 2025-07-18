import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { argumentId, userId } = await request.json();

  if (!argumentId || !userId) {
    return new Response(JSON.stringify({ error: 'Missing argumentId or userId' }), { status: 400 });
  }

  if (userId !== session.user.id) {
    return new Response(JSON.stringify({ error: 'Invalid userId' }), { status: 403 });
  }

  try {
    // Check if the argument exists
    const argument = await prisma.argument.findUnique({
      where: { id: argumentId },
    });
    if (!argument) {
      return new Response(JSON.stringify({ error: 'Argument not found' }), { status: 404 });
    }

    // Check for existing vote to prevent duplicates
    const existingVote = await prisma.vote.findFirst({
      where: { userId, argumentId },
    });
    if (existingVote) {
      return new Response(JSON.stringify({ error: 'User has already voted on this argument' }), { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: {
        userId,
        argumentId,
      },
    });

    return new Response(JSON.stringify(vote), { status: 200 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return new Response(JSON.stringify({ error: 'Failed to create vote' }), { status: 500 });
  }
}