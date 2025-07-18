
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { content, debateId, authorId, side } = await req.json();

  try {
    const argument = await prisma.argument.create({
      data: {
        content,
        debateId,
        authorId,
        side,
      },
    });
    return new Response(JSON.stringify(argument), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to post argument' }), { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { argumentId } = await req.json();
  const argument = await prisma.argument.findUnique({
    where: { id: argumentId },
  });

  if (argument.authorId !== session.user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  if (new Date(argument.createdAt).getTime() < Date.now() - 5 * 60 * 1000) {
    return new Response(JSON.stringify({ error: 'Edit window expired' }), { status: 403 });
  }

  try {
    await prisma.argument.delete({
      where: { id: argumentId },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete argument' }), { status: 500 });
  }
}