import './globals.css';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';
import SignOutButton from './components/SignOutButton';
import SessionProviderWrapper from './components/SessionProviderWrapper';
import SearchForm from './components/SearchForm';
import MobileNav from './components/MobileNav';
import { Suspense } from 'react';

// Loading component for better UX during navigation
function NavigationSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <SessionProviderWrapper session={session}>
          <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-600 dark:bg-blue-800 text-white shadow-lg">
            <div className="container mx-auto px-4">
              {/* Mobile Layout */}
              <div className="block lg:hidden">
                <div className="flex justify-between items-center py-3">
                  {/* Logo/Home with prefetching */}
                  <Link 
                    href="/" 
                    className="font-semibold text-lg"
                    prefetch={true}
                  >
                    Home
                  </Link>
                  
                  {/* Mobile Navigation Component */}
                  <MobileNav session={session} />
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex justify-between items-center py-4">
                {/* Left: Navigation Links with Prefetching */}
                <div className="flex items-center space-x-6">
                  <Link 
                    href="/" 
                    className="font-semibold hover:text-blue-200 transition-colors"
                    // prefetch={true}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/debates" 
                    className="hover:text-blue-200 transition-colors"
                    // prefetch={true}
                  >
                    Debates
                  </Link>
                  <Link 
                    href="/scoreboard" 
                    className="hover:text-blue-200 transition-colors"
                    // prefetch={true}
                  >
                    Scoreboard
                  </Link>
                  {session && (
                    <Link 
                      href="/debates/create" 
                      className="hover:text-blue-200 transition-colors"
                      // prefetch={true}
                    >
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
                        Welcome, {session.user.name}
                      </span>
                      <SignOutButton />
                    </>
                  ) : (
                    <Link href="/api/auth/signin" prefetch={true}>
                      <button className="py-2 px-4 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                        Sign In
                      </button>
                    </Link>
                  )}
                  <ThemeToggle />
                </div>
              </div>

              {/* Tablet Layout (md to lg) */}
              <div className="hidden md:block lg:hidden py-3">
                {/* Top Row: Navigation + User Info */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-4">
                    <Link 
                      href="/" 
                      className="font-semibold hover:text-blue-200 transition-colors"
                      // prefetch={true}
                    >
                      Home
                    </Link>
                    <Link 
                      href="/debates" 
                      className="hover:text-blue-200 transition-colors"
                      // prefetch={true}
                    >
                      Debates
                    </Link>
                    <Link 
                      href="/scoreboard" 
                      className="hover:text-blue-200 transition-colors"
                      // prefetch={true}
                    >
                      Scoreboard
                    </Link>
                    {session && (
                      <Link 
                        href="/debates/create" 
                        className="hover:text-blue-200 transition-colors"
                        // prefetch={true}
                      >
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
                      <Link href="/api/auth/signin" prefetch={true}>
                        <button className="py-2 px-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
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
          
          {/* Main content with loading boundary */}
          <main className="pt-16 lg:pt-20">
            <Suspense fallback={<NavigationSkeleton />}>
              {children}
            </Suspense>
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}