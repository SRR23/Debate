export default function LeaderboardSkeleton() {
  return (
    <div className="container mx-auto py-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-1/4"></div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mt-2"></div>
              </div>
            </div>
            <div className="inline-flex bg-white/10 rounded-xl p-1">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-1"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mx-1"></div>
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></th>
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></th>
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></th>
              <th className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b">
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-12"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
                <td className="px-6 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}