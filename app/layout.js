import './globals.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import SignOutButton from './components/SignOutButton';
import SessionProviderWrapper from './components/SessionProviderWrapper';
import SearchForm from './components/SearchForm';

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={session}>
          <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-lg">
            <div className="container mx-auto">
              {/* Mobile Layout */}
              <div className="block lg:hidden">
                {/* Top Row: Logo/Home + User Info */}
                <div className="flex justify-between items-center mb-3">
                  <Link href="/" className="font-semibold text-lg">
                    Home
                  </Link>
                  <div className="flex items-center space-x-2">
                    {session ? (
                      <>
                        <span className="text-sm truncate max-w-20">
                          {session.user.name}
                        </span>
                        <SignOutButton />
                      </>
                    ) : (
                      <Link href="/api/auth/signin">
                        <button className="py-1 px-2 text-sm bg-green-600 rounded hover:bg-green-700">
                          Sign In
                        </button>
                      </Link>
                    )}
                    <ThemeToggle />
                  </div>
                </div>

                {/* Middle Row: Search */}
                <div className="mb-3">
                  <SearchForm />
                </div>

                {/* Bottom Row: Navigation Links */}
                <div className="flex flex-wrap gap-2 text-sm">
                  <Link 
                    href="/debates" 
                    className="py-1 px-2 bg-blue-700 dark:bg-blue-900 rounded hover:bg-blue-800 dark:hover:bg-blue-700"
                  >
                    Debates
                  </Link>
                  <Link 
                    href="/scoreboard" 
                    className="py-1 px-2 bg-blue-700 dark:bg-blue-900 rounded hover:bg-blue-800 dark:hover:bg-blue-700"
                  >
                    Scoreboard
                  </Link>
                  {session && (
                    <Link 
                      href="/debates/create" 
                      className="py-1 px-2 bg-blue-700 dark:bg-blue-900 rounded hover:bg-blue-800 dark:hover:bg-blue-700"
                    >
                      Create Debate
                    </Link>
                  )}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex justify-between items-center">
                {/* Left: Navigation Links */}
                <div className="flex items-center space-x-6">
                  <Link href="/" className="font-semibold hover:text-blue-200">
                    Home
                  </Link>
                  <Link href="/debates" className="hover:text-blue-200">
                    Debates
                  </Link>
                  <Link href="/scoreboard" className="hover:text-blue-200">
                    Scoreboard
                  </Link>
                  {session && (
                    <Link href="/debates/create" className="hover:text-blue-200">
                      Create Debate
                    </Link>
                  )}
                </div>

                {/* Center: Search Form */}
                <div className="flex-1 flex justify-center max-w-md mx-8">
                  <SearchForm />
                </div>

                {/* Right: User Info and Theme Toggle */}
                <div className="flex items-center space-x-4">
                  {session ? (
                    <>
                      <span className="text-sm lg:text-base">
                        {session.user.name}
                      </span>
                      <SignOutButton />
                    </>
                  ) : (
                    <Link href="/api/auth/signin">
                      <button className="py-2 px-4 bg-green-600 rounded hover:bg-green-700 transition-colors">
                        Sign In
                      </button>
                    </Link>
                  )}
                  <ThemeToggle />
                </div>
              </div>

              {/* Tablet Layout (md to lg) */}
              <div className="hidden md:block lg:hidden">
                {/* Top Row: Navigation + User Info */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-4">
                    <Link href="/" className="font-semibold hover:text-blue-200">
                      Home
                    </Link>
                    <Link href="/debates" className="hover:text-blue-200">
                      Debates
                    </Link>
                    <Link href="/scoreboard" className="hover:text-blue-200">
                      Scoreboard
                    </Link>
                    {session && (
                      <Link href="/debates/create" className="hover:text-blue-200">
                        Create
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {session ? (
                      <>
                        <span className="text-sm truncate max-w-24">
                          {session.user.name}
                        </span>
                        <SignOutButton />
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

                {/* Bottom Row: Search */}
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <SearchForm />
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="pt-20 lg:pt-24">
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}