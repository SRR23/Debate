'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchForm() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/debates?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search debates..."
        className="px-2 py-1 rounded text-black"
      />
      <button type="submit" className="ml-2 px-3 py-1 bg-white text-blue-600 rounded">
        Search
      </button>
    </form>
  );
}