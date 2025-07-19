// pages/index.js or app/page.js
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="container mx-auto py-8 text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-6"
      >
        Welcome to Community Debate Arena
      </motion.h1>
      <p className="text-lg mb-4">
        Join debates, share your opinions, and vote on compelling arguments!
      </p>
      <Link href="/debates">
        <button className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
          Explore Debates
        </button>
      </Link>
    </div>
  );
}