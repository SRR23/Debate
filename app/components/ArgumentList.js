"use client";

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function ArgumentList({ argumentList, debateId, status }) {
  const { data: session } = useSession();
  const router = useRouter();

  console.log('ArgumentList: argumentList=', argumentList);
  console.log('ArgumentList: session.user.id=', session?.user?.id);

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

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

    console.log('Attempting to vote: argumentId=', argumentId, 'userId=', session.user.id);

    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ argumentId, userId: session.user.id }),
      });

      if (response.ok) {
        console.log('Vote successful: argumentId=', argumentId);
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Failed to vote:', errorData);
        alert(`Failed to vote: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error voting:', error);
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
        console.error('Failed to delete argument:', errorData);
        alert(`Failed to delete argument: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting argument:', error);
      alert('An error occurred while deleting the argument');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Arguments</h2>
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
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              {editingId === arg.id ? (
                <div>
                  <input
                    type="text"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => handleEditSave(arg.id)}
                    className="mt-2 py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="mt-2 ml-2 py-1 px-3 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-semibold">{arg.side.toUpperCase()}: {arg.content}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By {arg.author.name || 'Anonymous'} at {new Date(arg.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Votes: {arg.votes.length}</p>
                  {status === 'active' && (
                    <button
                      onClick={() => handleVote(arg.id)}
                      className="mt-2 py-1 px-3 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                      Vote
                    </button>
                  )}
                  {canEditOrDelete && (
                    <>
                      <button
                        onClick={() => handleEditClick(arg)}
                        className="mt-2 ml-2 py-1 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(arg.id)}
                        className="mt-2 ml-2 py-1 px-3 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </>
              )}
            </motion.div>
          );
        })
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No arguments yet.</p>
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
};