export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gaming-black text-gray-100 flex flex-col justify-start pb-20 px-4 md:px-8 pt-10">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 animate-pulse">
        {/* Header HUD Block */}
        <div className="w-full bg-[#0c0d12]/60 border border-gaming-gray/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-full bg-gaming-gray/20" />
            <div className="flex flex-col gap-2 flex-1 md:flex-initial">
              <div className="h-6 w-40 bg-gaming-gray/30 rounded-lg" />
              <div className="h-4 w-28 bg-gaming-gray/20 rounded-md" />
            </div>
          </div>
          <div className="h-10 w-full md:w-32 bg-gaming-gray/20 rounded-xl" />
        </div>

        {/* Dashboard Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Portfolio Block */}
          <div className="lg:col-span-2 bg-[#0c0d12]/40 border border-gaming-gray/20 rounded-2xl p-6 flex flex-col gap-6">
            <div className="h-5 w-48 bg-gaming-gray/30 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gaming-gray/20 rounded-xl" />
              <div className="h-10 bg-gaming-gray/20 rounded-xl" />
            </div>
            <div className="h-32 bg-gaming-gray/10 rounded-2xl" />
            <div className="h-40 bg-gaming-gray/10 rounded-2xl" />
          </div>

          {/* Right Preview/Stats Block */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0c0d12]/40 border border-gaming-gray/20 rounded-2xl p-6 flex flex-col gap-6">
              <div className="h-5 w-32 bg-gaming-gray/30 rounded" />
              <div className="h-64 bg-gaming-gray/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
