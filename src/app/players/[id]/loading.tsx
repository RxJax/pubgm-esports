export default function PlayerLoading() {
  return (
    <div className="min-h-screen bg-gaming-black text-gray-100 flex flex-col justify-start pb-20 px-4 md:px-8 pt-10">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-pulse">
        {/* Profile Card Shell */}
        <div className="bg-[#0c0d12]/60 border border-gaming-gray/30 rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
          {/* Top section */}
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-24 h-32 bg-gaming-gray/25 rounded-2xl shrink-0" />
            <div className="flex-1 w-full flex flex-col gap-2.5">
              <div className="flex justify-between items-start">
                <div className="h-7 w-48 bg-gaming-gray/35 rounded-lg" />
                <div className="h-6 w-24 bg-gaming-gray/20 rounded" />
              </div>
              <div className="h-4 w-32 bg-gaming-gray/20 rounded" />
              <div className="flex gap-2 mt-2">
                <div className="h-5 w-16 bg-gaming-gray/15 rounded" />
                <div className="h-5 w-20 bg-gaming-gray/15 rounded" />
              </div>
            </div>
          </div>

          {/* Stats/Bio grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gaming-gray/20 pt-6">
            <div className="flex flex-col gap-3">
              <div className="h-4 w-28 bg-gaming-gray/30 rounded" />
              <div className="h-16 bg-gaming-gray/10 rounded-xl" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-4 w-36 bg-gaming-gray/30 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gaming-gray/15 rounded-lg" />
                <div className="h-12 bg-gaming-gray/15 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
