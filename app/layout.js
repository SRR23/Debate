// app/layout.js
import './globals.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import SignOutButton from './components/SignOutButton'; // Import the new component

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 dark:bg-blue-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="space-x-4">
              <Link href="/">Home</Link>
              <Link href="/debates">Debates</Link>
              <Link href="/scoreboard">Scoreboard</Link>
              {session && <Link href="/debates/create">Create Debate</Link>}
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span>{session.user.name}</span>
                  <SignOutButton /> {/* Use the Client Component */}
                </>
              ) : (
                <Link href="/api/auth/signin">
                  <button className="py-1 px-3 bg-green-600 rounded hover:bg-green-700">
                    Sign In
                  </button>
                </Link>
              )}
              <ThemeToggle />
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}