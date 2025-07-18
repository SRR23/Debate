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

export async function PUT(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { argumentId, content } = await request.json();

  if (!argumentId || !content) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    const argument = await prisma.argument.findUnique({
      where: { id: argumentId },
    });

    if (!argument) {
      return new Response(JSON.stringify({ error: 'Argument not found' }), { status: 404 });
    }

    if (argument.authorId !== session.user.id) {
      return new Response(JSON.stringify({ error: 'Not authorized to edit this argument' }), { status: 403 });
    }

    // Check if the argument is within the 5-minute editable window
    const createdAt = new Date(argument.createdAt);
    const now = new Date();
    if (now.getTime() - createdAt.getTime() > 5 * 60 * 1000) {
      return new Response(JSON.stringify({ error: 'Edit window has expired' }), { status: 403 });
    }

    const updatedArgument = await prisma.argument.update({
      where: { id: argumentId },
      data: { content },
    });

    return new Response(JSON.stringify(updatedArgument), { status: 200 });
  } catch (error) {
    console.error('Error updating argument:', error);
    return new Response(JSON.stringify({ error: 'Failed to update argument' }), { status: 500 });
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