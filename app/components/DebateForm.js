"use client";

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';
// No external icon dependencies needed

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.string().transform((val) => val.split(',').map(tag => tag.trim())),
  category: z.string().min(1, 'Category is required'),
  image: z.instanceof(File).optional(),
  duration: z.enum(['1', '12', '24'], { message: 'Invalid duration' }),
});

export default function DebateForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const watchedFields = watch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setImageFile(file);
      setValue('image', file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setValue('image', undefined);
  };

  const onSubmit = async (data) => {
    if (!session) {
      alert('Please log in to create a debate');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('tags', JSON.stringify(data.tags));
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
        body: formData,
      });

      if (response.ok) {
        router.push('/debates');
      } else {
        const errorData = await response.json();
        alert(`Failed to create debate: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error creating debate: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const durationOptions = [
    { value: '1', label: '1 Hour', subtitle: 'Quick debate' },
    { value: '12', label: '12 Hours', subtitle: 'Half-day discussion' },
    { value: '24', label: '24 Hours', subtitle: 'Full-day debate' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg"
          >
            <span className="text-2xl">💬</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Debate
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Start a meaningful discussion and engage with the community
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Title Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span className="w-4 h-4 mr-2 text-blue-600">📝</span>
                Debate Title
              </label>
              <input
                {...register('title')}
                placeholder="Enter a compelling debate title..."
                className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm flex items-center mt-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {errors.title.message}
                </motion.p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span className="w-4 h-4 mr-2 text-blue-600">📄</span>
                Description
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe your debate topic in detail..."
                rows={4}
                className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              />
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm flex items-center mt-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {errors.description.message}
                </motion.p>
              )}
            </div>

            {/* Tags and Category Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  <span className="w-4 h-4 mr-2 text-blue-600">🏷️</span>
                  Tags
                </label>
                <input
                  {...register('tags')}
                  placeholder="politics, society, technology..."
                  className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.tags && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center mt-2"
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.tags.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  <span className="w-4 h-4 mr-2 text-blue-600">📂</span>
                  Category
                </label>
                <input
                  {...register('category')}
                  placeholder="e.g., Politics, Technology, Social Issues..."
                  className="w-full p-4 bg-gray-50/50 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.category && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm flex items-center mt-2"
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    {errors.category.message}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span className="w-4 h-4 mr-2 text-blue-600">🖼️</span>
                Cover Image (Optional)
              </label>
              
              {!imagePreview ? (
                <label className="group relative block w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto text-gray-400 group-hover:text-blue-500 transition-colors mb-4 flex items-center justify-center text-3xl">
                      ⬆️
                    </div>
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              ) : (
                <div className="relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-20 w-20 object-cover rounded-xl shadow-md" 
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Image uploaded successfully
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <a
                          href={imagePreview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                        >
                          <span className="mr-1">👁️</span>
                          View Full Size
                        </a>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {errors.image && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm flex items-center mt-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {errors.image.message}
                </motion.p>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-4">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                <span className="w-4 h-4 mr-2 text-blue-600">⏰</span>
                Debate Duration
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {durationOptions.map((option) => (
                  <label key={option.value} className="relative cursor-pointer">
                    <input
                      {...register('duration')}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                      watchedFields.duration === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}>
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.duration && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm flex items-center mt-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  {errors.duration.message}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Debate...
                </>
              ) : (
                'Create Debate'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            By creating a debate, you agree to our community guidelines and terms of service.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}