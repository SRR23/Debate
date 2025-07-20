import DebateCard from '../components/DebateCard';
import prisma from '../lib/prisma';
import { Suspense } from 'react';
import DebateCardSkeleton from '../skeleton/DebateCardSkeleton';

export default async function Debates({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.search?.trim() || '';
  const page = parseInt(resolvedSearchParams?.page) || 1;
  const pageSize = 20;

  let debates = [];

  try {
    if (q.length > 0) {
      // Use full-text search for title and category
      debates = await prisma.debate.findMany({
        where: {
          OR: [
            {
              title: {
                search: q, // Prisma's full-text search for PostgreSQL
              },
            },
            {
              category: {
                search: q,
              },
            },
            {
              tags: {
                has: q,
              },
            },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true, // Only select necessary fields
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc', // Sort by most recent
        },
      });
    } else {
      // If no search query, fetch all debates
      debates = await prisma.debate.findMany({
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  } catch (error) {
    console.error('Error fetching debates:', error);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">
        {q ? `Search Results for "${q}"` : 'All Debates'}
      </h1>
      <Suspense fallback={<DebateCardSkeleton />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {debates.length > 0 ? (
            debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))
          ) : (
            <p>No debates found.</p>
          )}
        </div>
      </Suspense>
      {/* Pagination controls */}
      {/* <div className="mt-6 flex justify-center">
        <a
          href={`?page=${page - 1}${q ? `&search=${encodeURIComponent(q)}` : ''}`}
          className={`px-4 py-2 mx-1 bg-gray-200 rounded ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={page === 1}
        >
          Previous
        </a>
        <a
          href={`?page=${page + 1}${q ? `&search=${encodeURIComponent(q)}` : ''}`}
          className="px-4 py-2 mx-1 bg-gray-200 rounded"
        >
          Next
        </a>
      </div> */}
    </div>
  );
}