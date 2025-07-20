"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function ArgumentList({ argumentList, debateId, status, endTime }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Check if the debate has expired based on status or endTime
  const isDebateExpired = status !== 'active' || (endTime && new Date(endTime) < new Date());

  const handleEditClick = (arg) => {
    setEditingId(arg.id);
    setEditContent(arg.content);
  };

  const handleEditSave = async (argumentId) => {
    try {
      const response = await fetch('/api/arguments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argumentId, content: editContent }),
      });

      if (response.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to edit argument: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('An error occurred while editing the argument');
    }
  };

  const handleVote = async (argumentId) => {
    if (!session) {
      alert('Please log in to vote');
      return;
    }

    if (isDebateExpired) {
      alert('This debate has ended. Voting is no longer available.');
      return;
    }

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argumentId, userId: session.user.id }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to vote: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('An error occurred while voting');
    }
  };

  const handleDelete = async (argumentId) => {
    try {
      const response = await fetch('/api/arguments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argumentId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete argument: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert('An error occurred while deleting the argument');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {argumentList && argumentList.length > 0 ? (
        argumentList.map((arg) => {
          const canEditOrDelete =
            session &&
            arg.authorId === session.user.id &&
            new Date(arg.createdAt).getTime() > Date.now() - 5 * 60 * 1000;

          return (
            <motion.div
              key={arg.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700"
            >
              {editingId === arg.id ? (
                <div className="space-y-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
                    rows={4}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditSave(arg.id)}
                      className="py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="py-2 px-4 bg-gray-400 text-white rounded-xl hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-600 transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${arg.side === 'support' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      <svg className={`w-5 h-5 ${arg.side === 'support' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arg.side === 'support' ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        <span className={`uppercase ${arg.side === 'support' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{arg.side}</span>: {arg.content}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        By {arg.author.name || 'Anonymous'} at {new Date(arg.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Votes: {arg.votes.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleVote(arg.id)}
                      className={`py-2 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all duration-200 ${isDebateExpired ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : ''}`}
                      disabled={isDebateExpired}
                    >
                      Vote
                    </button>
                    {canEditOrDelete && (
                      <>
                        <button
                          onClick={() => handleEditClick(arg)}
                          className="py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(arg.id)}
                          className="py-2 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Arguments Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {isDebateExpired
              ? 'This debate has no arguments.'
              : session
              ? 'Be the first to share your perspective!'
              : 'Join the debate to share your arguments.'}
          </p>
          {!isDebateExpired && !session && (
            <button
              onClick={() => router.push('/api/auth/signin')}
              className="py-2 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign In to Join
            </button>
          )}
        </div>
      )}
    </div>
  );
}

ArgumentList.propTypes = {
  argumentList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      side: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      author: PropTypes.shape({
        name: PropTypes.string,
      }).isRequired,
      votes: PropTypes.array.isRequired,
      authorId: PropTypes.string.isRequired,
    })
  ).isRequired,
  debateId: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  endTime: PropTypes.string,
};