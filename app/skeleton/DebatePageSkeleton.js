export default function DebatePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section with Image */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden mb-8 border border-gray-100 dark:border-gray-700">
          {/* Hero Image */}
          <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" /> {/* Placeholder for image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Floating status badges on image */}
            <div className="absolute top-6 left-6 flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md border bg-green-100/90 text-green-800 border-green-200/50 dark:bg-green-900/80 dark:text-green-200 dark:border-green-700/50">
                🟢 Active Debate
              </span>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-100/90 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 rounded-full text-sm font-semibold backdrop-blur-md border border-amber-200/50 dark:border-amber-700/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Winner: TBD
              </div>
            </div>

            {/* Title overlay on image */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                Debate Title
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-lg drop-shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Created by User</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}