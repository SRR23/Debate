// components/SignOutButton.js
'use client'; // Mark this as a Client Component

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="py-1 px-3 bg-red-600 rounded hover:bg-red-700"
    >
      Sign Out
    </button>
  );
}