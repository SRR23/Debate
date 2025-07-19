import { getServerSession } from 'next-auth/next';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import ArgumentForm from '../../components/ArgumentForm';
import ArgumentList from '../../components/ArgumentList';
import prisma from '../../lib/prisma';
import DebatePageSkeleton from '@/app/skeleton/DebatePageSkeleton';


export default async function DebatePage({ params }) {

  // Fetch session and params
  const session = await getServerSession(authOptions);
  // Explicitly await params to satisfy Next.js checks
  const { id: debateId } = await Promise.resolve(params);

  const debate = await prisma.debate.findUnique({
    where: { id: debateId },
    include: { creator: true, arguments: { include: { author: true, votes: true } }, participants: true },
  });

  if (!debate) {
    console.log('Debate not found for ID:', debateId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Debate Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">The debate you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const userHasJoined = session && debate.participants.some(p => p.id === session.user.id);
 
  const userSide = userHasJoined
    ? await prisma.sideChoice.findFirst({
      where: { debateId: debate.id, userId: session.user.id },
      select: { side: true },
    })
    : null;

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
    <Suspense fallback={<DebatePageSkeleton />}>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Header Section with Image */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">

          {/* Hero Image if available */}
          {debate.image && (
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
              <img
                src={debate.image}
                alt={debate.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              {/* Floating status badges on image */}
              <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border ${debate.status === 'active'
                    ? 'bg-green-100/90 text-green-800 border-green-200/50 dark:bg-green-900/80 dark:text-green-200 dark:border-green-700/50'
                    : 'bg-red-100/90 text-red-800 border-red-200/50 dark:bg-red-900/80 dark:text-red-200 dark:border-red-700/50'
                  }`}>
                  {debate.status === 'active' ? '🟢 Active Debate' : '🔴 Debate Ended'}
                </span>

                {isDebateExpired && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/90 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 rounded-full text-sm font-semibold backdrop-blur-md border border-amber-200/50 dark:border-amber-700/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Winner: {winningSide}
                  </div>
                )}
              </div>

              {/* Title overlay on image */}
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                  {debate.title}
                </h1>
                <div className="flex items-center gap-2 text-white/90 text-lg drop-shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Created by {debate.creator.name}</span>
                </div>
              </div>
            </div>
          )}

          {/* Content section */}
          <div className="p-8">
            {/* Show title and badges here only if no image */}
            {!debate.image && (
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${debate.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {debate.status === 'active' ? '🟢 Active Debate' : '🔴 Debate Ended'}
                  </span>

                  {isDebateExpired && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-semibold">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Winner: {winningSide}
                    </div>
                  )}
                </div>

                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 leading-tight">
                  {debate.title}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Created by {debate.creator.name}</span>
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {debate.description}
            </p>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-300">Creator</span>
                </div>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{debate.creator.name}</span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Category</span>
                </div>
                <span className="text-blue-900 dark:text-blue-100 font-semibold">{debate.category}</span>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Participants</span>
                </div>
                <span className="text-purple-900 dark:text-purple-100 font-semibold">{debate.participants.length}</span>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Ends At</span>
                </div>
                <span className="text-emerald-900 dark:text-emerald-100 font-semibold text-sm">
                  {new Date(debate.endsAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tags:</span>
              {debate.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* User Status Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Join Debate Card */}
          {!userHasJoined && !isDebateExpired && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Join the Debate</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Choose your side and start debating</p>
                </div>
              </div>

              <form action={joinDebate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Your Position
                  </label>
                  <select
                    name="side"
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                  >
                    <option value="support">👍 Support</option>
                    <option value="oppose">👎 Oppose</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:transform-none disabled:shadow-md"
                  disabled={isDebateExpired}
                >
                  Join Debate
                </button>
              </form>
            </div>
          )}

          {/* User Side Card */}
          {userHasJoined && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${userSide?.side === 'support'
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                  <svg className={`w-6 h-6 ${userSide?.side === 'support'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7-7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Position</h3>
                  <p className={`font-semibold text-lg ${userSide?.side === 'support'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                    {userSide?.side === 'support' ? '👍 Supporting' : '👎 Opposing'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Debate Ended Message */}
          {!userHasJoined && isDebateExpired && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl shadow-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200">Debate Has Ended</h3>
                  <p className="text-amber-700 dark:text-amber-300">You can no longer join this debate</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Argument Form */}
        {debate.status === 'active' && userHasJoined && (
          <div className="mb-8">
            <ArgumentForm debateId={debate.id} side={userSide?.side} endTime={debate.endsAt} />
          </div>
        )}

        {/* Arguments List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Arguments & Discussion
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {debate.arguments.length} argument{debate.arguments.length !== 1 ? 's' : ''} posted
            </p>
          </div>
          <ArgumentList
            argumentList={debate.arguments}
            debateId={debate.id}
            status={debate.status}
            endTime={debate.endsAt}
          />
        </div>
      </div>
    </div>
    </Suspense>
  );
}