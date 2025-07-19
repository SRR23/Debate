'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  // Clear search input when the route changes
  useEffect(() => {
    setQuery('');
  }, [pathname]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/debates?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search debates..."
        className="px-3 py-2 rounded-md text-black bg-white dark:bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 w-64"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}