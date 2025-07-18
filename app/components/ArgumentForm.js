"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const bannedWords = ['stupid', 'idiot', 'dumb'];

const schema = z.object({
  content: z
    .string()
    .min(10, 'Argument must be at least 10 characters')
    .refine(
      (val) => !bannedWords.some((word) => val.toLowerCase().includes(word)),
      { message: 'Argument contains inappropriate words' }
    ),
});

export default function ArgumentForm({ debateId, side }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!session) {
      alert('Please log in to post an argument');
      return;
    }

    try {
      const response = await fetch('/api/arguments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          debateId,
          authorId: session.user.id,
          side,
        }),
      });

      if (response.ok) {
        reset(); // Clear the form
        router.refresh(); // Refresh the page
      } else {
        const errorData = await response.json();
        console.error('Failed to post argument:', errorData);
        alert(`Failed to post argument: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting argument:', error);
      alert('An error occurred while submitting the argument');
    }
  };

  if (!side) {
    console.log('ArgumentForm: No side provided, debateId=', debateId);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Your Argument ({side})</label>
          <textarea
            {...register('content')}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600"
            rows="4"
            placeholder="Write your argument here..."
          />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>
        <button
          type="submit"
          className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Post Argument
        </button>
      </form>
    </motion.div>
  );
}