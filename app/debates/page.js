
import DebateCard from '../components/DebateCard';
import prisma from '../lib/prisma'; // Adjust the import path as necessary

export default async function Debates() {
  const debates = await prisma.debate.findMany({
    include: { creator: true },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">All Debates</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {debates.map((debate) => (
          <DebateCard key={debate.id} debate={debate} />
        ))}
      </div>
    </div>
  );
}