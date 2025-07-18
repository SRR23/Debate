import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ArgumentForm from '../../components/ArgumentForm';
import ArgumentList from '../../components/ArgumentList';
import prisma from '../../lib/prisma';

export default async function DebatePage({ params }) {
  const session = await getServerSession(authOptions);
  // Explicitly await params to satisfy Next.js checks
  const { id: debateId } = await Promise.resolve(params);

  console.log('Params:', params);
  console.log('Session:', session);

  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: { creator: true, arguments: { include: { author: true, votes: true } }, participants: true },
  });

  if (!debate) {
    console.log('Debate not found for ID:', debateId);
    return <div>Debate not found</div>;
  }

  console.log('Debate:', debate);
  console.log('Debate status:', debate.status);
  console.log('Arguments:', debate.arguments);

  const userHasJoined = session && debate.participants.some(p => p.id === session.user.id);
  console.log('User has joined:', userHasJoined);
  console.log('Participants:', debate.participants);
  console.log('Session user ID:', session?.user?.id);

  const userSide = userHasJoined
    ? await prisma.sideChoice.findFirst({
        where: { debateId: debate.id, userId: session.user.id },
        select: { side: true },
      })
    : null;

  console.log('User side:', userSide);

  async function joinDebate(formData) {
    'use server';
    const side = formData.get('side');
    if (!session) {
      redirect('/api/auth/signin');
    }
    try {
      await prisma.debate.update({
        where: { id: debateId },
        data: {
          participants: { connect: { id: session.user.id } },
        },
      });
      await prisma.sideChoice.create({
        data: {
          userId: session.user.id,
          debateId: debateId,
          side: side,
        },
      });
      redirect(`/debates/${debateId}`);
    } catch (error) {
      console.error('Error joining debate:', error);
      throw new Error('Failed to join debate');
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{debate.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{debate.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Category: {debate.category}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Tags: {debate.tags.join(', ')}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ends at: {new Date(debate.endsAt).toLocaleString()}</p>
      {debate.status === 'closed' && <p className="text-lg font-semibold">Winner: {debate.winner || 'TBD'}</p>}

      {/* Debug output to confirm button conditions */}
      <p className="text-sm text-gray-500">
        Debug: userHasJoined={userHasJoined.toString()}, debate.status={debate.status}, userSide={userSide?.side || 'none'}
      </p>

      {!userHasJoined && debate.status === 'active' ? (
        <form action={joinDebate} className="my-4 bg-red-200">
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
      ) : (
        <p className="text-sm text-red-500">
          Join button not shown: userHasJoined={userHasJoined.toString()}, debate.status={debate.status}
        </p>
      )}

      {userHasJoined && <p className="text-lg font-semibold">Your Side: {userSide?.side || 'Not selected'}</p>}

      {debate.status === 'active' && userHasJoined && (
        <ArgumentForm debateId={debate.id} side={userSide?.side} />
      )}

      <ArgumentList argumentList={debate.arguments} debateId={debate.id} status={debate.status} />
    </div>
  );
}