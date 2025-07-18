"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.string().transform((val) => val.split(',').map(tag => tag.trim())),
  category: z.string().min(1, 'Category is required'),
  image: z.instanceof(File).optional(), // Changed to File type for proper validation
  duration: z.enum(['1', '12', '24'], { message: 'Invalid duration' }),
});

export default function DebateForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(schema),
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Added to store the file

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file); // Store the file
      setValue('image', file); // Set the file in the form
    }
  };

  const onSubmit = async (data) => {
    if (!session) {
      alert('Please log in to create a debate');
      return;
    }

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', JSON.stringify(data.tags)); // Stringify tags array
    formData.append('category', data.category);
    formData.append('duration', data.duration);
    formData.append('creatorId', session.user.id);

    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + parseInt(data.duration));
    formData.append('endsAt', endsAt.toISOString());

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('/api/debates', {
        method: 'POST',
        body: formData, // Send FormData directly
      });

      if (response.ok) {
        router.push('/debates');
      } else {
        const errorData = await response.json();
        alert(`Failed to create debate: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error creating debate: ${error.message}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            {...register('title')}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            {...register('description')}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma-separated)</label>
          <input
            {...register('tags')}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.tags && <p className="text-red-500 text-sm">{errors.tags.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            {...register('category')}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Image</label>
          <div className="mt-1 flex items-center space-x-4">
            <label className="py-2 px-4 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <div className="flex items-center space-x-2">
                <img src={imagePreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                <a
                  href={imagePreview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  View Image
                </a>
              </div>
            )}
          </div>
          {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Duration</label>
          <select
            {...register('duration')}
            className="mt-1 p-2 w-full border rounded dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="1">1 Hour</option>
            <option value="12">12 Hours</option>
            <option value="24">24 Hours</option>
          </select>
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration.message}</p>}
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Create Debate
        </button>
      </form>
    </motion.div>
  );
}