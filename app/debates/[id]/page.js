
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ArgumentForm from '../../components/ArgumentForm';
import ArgumentList from '../../components/ArgumentList';
import prisma from '../../lib/prisma'; // Adjust the import path as necessary

export default async function DebatePage({ params }) {
  const session = await getServerSession(authOptions);
  const debate = await prisma.debate.findUnique({
    where: { id: params.id },
    include: { creator: true, arguments: { include: { author: true, votes: true } }, participants: true },
  });

  if (!debate) {
    return <div>Debate not found</div>;
  }

  const userHasJoined = session && debate.participants.some(p => p.id === session.user.id);
  const userSide = userHasJoined
    ? await prisma.argument.findFirst({
        where: { debateId: debate.id, authorId: session.user.id },
        select: { side: true },
      })
    : null;

  async function joinDebate(formData) {
    'use server';
    const side = formData.get('side');
    if (!session) {
      redirect('/api/auth/signin');
    }
    await prisma.debate.update({
      where: { id: params.id },
      data: {
        participants: { connect: { id: session.user.id } },
      },
    });
    // Store side in first argument (handled in ArgumentForm)
    redirect(`/debates/${params.id}`);
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{debate.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{debate.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Category: {debate.category}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Tags: {debate.tags.join(', ')}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ends at: {new Date(debate.endsAt).toLocaleString()}</p>
      {debate.status === 'closed' && <p className="text-lg font-semibold">Winner: {debate.winner || 'TBD'}</p>}

      {!userHasJoined && debate.status === 'active' && (
        <form action={joinDebate} className="my-4">
          <label className="block text-sm font-medium mb-2">Join Debate</label>
          <select name="side" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            <option value="support">Support</option>
            <option value="oppose">Oppose</option>
          </select>
          <button
            type="submit"
            className="ml-2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Join
          </button>
        </form>
      )}

      {userHasJoined && <p className="text-lg font-semibold">Your Side: {userSide?.side}</p>}

      {debate.status === 'active' && <ArgumentForm debateId={debate.id} side={userSide?.side} />}
      <ArgumentList arguments={debate.arguments} debateId={debate.id} status={debate.status} />
    </div>
  );
}