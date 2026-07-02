"use client";

import React from "react";

export default function DatabaseErrorCard() {
  return (
    <div className="flex-1 bg-gaming-black text-gray-100 min-h-[70vh] flex flex-col items-center justify-center px-6 py-12 text-center relative overflow-hidden">
      {/* Cyber grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,189,3,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,189,3,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-airdrop-red/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] bg-digital-yellow/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-md flex flex-col items-center gap-6 p-8 rounded-3xl bg-gaming-gray/40 border border-gaming-gray/80 backdrop-blur-md shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gaming-black/60 border border-airdrop-red/30 text-airdrop-red flex items-center justify-center text-3xl shadow-inner animate-pulse">
          ⚠️
        </div>
        
        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider bg-gradient-to-r from-airdrop-red via-digital-yellow to-airdrop-red bg-clip-text text-transparent">
          System Maintenance
        </h1>
        
        <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-sm">
          We're having trouble reaching the scouting records. Please refresh or try again in a moment.
        </p>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gaming-gray/80 to-transparent my-1" />

        <button
          onClick={() => window.location.reload()}
          className="bg-gaming-gray/80 hover:bg-gaming-gray text-digital-yellow border border-digital-yellow/30 font-bold px-6 py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
