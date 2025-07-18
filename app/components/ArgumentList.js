
"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ArgumentList({ argumentList, debateId, status }) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleVote = async (argumentId) => {
    if (!session) {
      alert('Please log in to vote');
      return;
    }

    const response = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ argumentId, userId: session.user.id }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      alert('Failed to vote');
    }
  };

  const handleDelete = async (argumentId) => {
    const response = await fetch('/api/arguments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ argumentId }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      alert('Failed to delete argument');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Arguments</h2>
      {arguments.map((arg) => {
        const canEditOrDelete =
          session &&
          arg.authorId === session.user.id &&
          new Date(arg.createdAt).getTime() > Date.now() - 5 * 60 * 1000;

        return (
          <motion.div
            key={arg.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
          >
            <p className="font-semibold">{arg.side.toUpperCase()}: {arg.content}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              By {arg.author.name} at {new Date(arg.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Votes: {arg.voteCount}</p>
            {status === 'active' && (
              <button
                onClick={() => handleVote(arg.id)}
                className="mt-2 py-1 px-3 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                Vote
              </button>
            )}
            {canEditOrDelete && (
              <button
                onClick={() => handleDelete(arg.id)}
                className="mt-2 ml-2 py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Delete
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}