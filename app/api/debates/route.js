import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const data = await req.json();
  const { title, description, tags, category, image, duration, creatorId, endsAt } = data;

  try {
    const debate = await prisma.debate.create({
      data: {
        title,
        description,
        tags,
        category,
        image,
        duration: parseInt(duration),
        creatorId,
        endsAt: new Date(endsAt),
      },
    });
    return new Response(JSON.stringify(debate), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create debate' }), { status: 500 });
  }
}

export async function GET() {
  try {
    const debates = await prisma.debate.findMany({
      include: { creator: true },
    });
    return new Response(JSON.stringify(debates), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch debates' }), { status: 500 });
  }
}