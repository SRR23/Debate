import DebateCard from '../components/DebateCard';
import prisma from '../lib/prisma';

export default async function Debates({ searchParams }) {
  // Await searchParams to resolve the Promise
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.search || '';

  // Fetch debates based on search query
  const debates = await prisma.debate.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: { creator: true },
    take: 20,
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {q ? `Search Results for "${q}"` : 'All Debates'}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debates.length > 0 ? (
          debates.map((debate) => (
            <DebateCard key={debate.id} debate={debate} />
          ))
        ) : (
          <p>No debates found.</p>
        )}
      </div>
    </div>
  );
}