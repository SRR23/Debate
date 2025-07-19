import prisma from '@/app/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  // Search debates by title, tags, or category
  const debates = await prisma.debate.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 20,
  });

  return new Response(JSON.stringify(debates), { status: 200 });
}