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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search debates..."
          className="flex-1 px-3 py-2 rounded-l-md text-black bg-white dark:bg-gray-100 border border-gray-300 border-r-0 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 min-w-0"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors whitespace-nowrap border border-green-500 dark:border-green-600"
        >
          Search
        </button>
      </div>
    </form>
  );
}