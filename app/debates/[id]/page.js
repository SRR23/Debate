import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
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

  // Check if the debate has expired based on status or endsAt
  const isDebateExpired = debate.status !== 'active' || (debate.endsAt && new Date(debate.endsAt) < new Date());

  // Calculate winning side based on the argument with the maximum votes
  let winningSide = 'TBD';
  if (isDebateExpired && debate.arguments.length > 0) {
    const maxVotedArgument = debate.arguments.reduce((maxArg, arg) => {
      const voteCount = arg.votes.reduce((sum, vote) => sum + (vote.value || 0), 0);
      const maxVoteCount = maxArg ? maxArg.votes.reduce((sum, vote) => sum + (vote.value || 0), 0) : -Infinity;
      return voteCount > maxVoteCount ? arg : maxArg;
    }, null);

    winningSide = maxVotedArgument ? maxVotedArgument.side : 'Tie';
  } else if (isDebateExpired && debate.arguments.length === 0) {
    winningSide = 'No arguments';
  }

  async function joinDebate(formData) {
    'use server';
    const side = formData.get('side');
    if (!session) {
      redirect('/api/auth/signin');
    }
    if (isDebateExpired) {
      throw new Error('Debate has ended. You cannot join now.');
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
      // Revalidate the current page to refresh server-side data
      revalidatePath(`/debate/${debateId}`);
      return { success: true };
    } catch (error) {
      throw new Error('Failed to join debate. Please try again later.');
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{debate.title}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{debate.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Category: {debate.category}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Tags: {debate.tags.join(', ')}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Ends at: {new Date(debate.endsAt).toLocaleString()}</p>
      {isDebateExpired && <p className="text-lg font-semibold">Winner: {winningSide}</p>}

      {/* Debug output to confirm button conditions */}
      <p className="text-sm text-gray-500">
        {/* Debug: userHasJoined={String(userHasJoined)},
        debate.status={debate.status},
        isDebateExpired={String(isDebateExpired)},
        userSide={userSide?.side || 'none'} */}
      </p>

      {!userHasJoined && !isDebateExpired ? (
        <form action={joinDebate} className="my-4 bg-red-200">
          <label className="block text-sm font-medium mb-2">Join Debate</label>
          <select name="side" className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
            <option value="support">Support</option>
            <option value="oppose">Oppose</option>
          </select>
          <button
            type="submit"
            className="ml-2 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            disabled={isDebateExpired} // Disable the join button if debate is expired
          >
            Join
          </button>
        </form>
      ) : (
        <p className="text-sm text-red-500">
          {/* Join button not shown: userHasJoined={String(userHasJoined ?? 'null')}, isDebateExpired={String(isDebateExpired ?? 'null')} */}
        </p>
      )}

      {userHasJoined && <p className="text-lg font-semibold">Your Side: {userSide?.side || 'Not selected'}</p>}

      {debate.status === 'active' && userHasJoined && (
        <ArgumentForm debateId={debate.id} side={userSide?.side} endTime={debate.endsAt} />
      )}

      <ArgumentList argumentList={debate.arguments} debateId={debate.id} status={debate.status} endTime={debate.endsAt} />
    </div>
  );
}