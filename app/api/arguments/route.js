import { getServerSession } from 'next-auth/next';
import prisma from '@/app/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { content, debateId, authorId, side } = await request.json();

  if (!content || !debateId || !authorId || !side) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    const argument = await prisma.argument.create({
      data: {
        content,
        side,
        debateId,
        authorId,
      },
    });
    return new Response(JSON.stringify(argument), { status: 200 });
  } catch (error) {
    console.error('Error creating argument:', error);
    return new Response(JSON.stringify({ error: 'Failed to create argument' }), { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { argumentId } = await request.json();

  if (!argumentId) {
    return new Response(JSON.stringify({ error: 'Missing argumentId' }), { status: 400 });
  }

  try {
    await prisma.argument.delete({
      where: { id: argumentId },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting argument:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete argument' }), { status: 500 });
  }
}