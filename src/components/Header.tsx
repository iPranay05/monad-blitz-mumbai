import React from "react";
import { Briefcase, Eye, ShieldCheck, HelpCircle } from "lucide-react";

interface HeaderProps {
  currentView: "operations" | "worker";
  setView: (view: "operations" | "worker") => void;
  treasuryBalance: number;
  activeGigsCount: number;
}

export default function Header({ currentView, setView, treasuryBalance, activeGigsCount }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Agent status */}
          <div className="flex items-center space-x-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-sans font-bold tracking-tight text-gray-900 text-lg">GigBoss-AI</span>
                <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Autonomous Core Active
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono">v1.2.0 • Corporate Oracle</p>
            </div>
          </div>

          {/* Dual-View Switcher */}
          <div className="flex items-center bg-gray-150 p-1 rounded-xl border border-gray-200">
            <button
              id="switch-ops-button"
              onClick={() => setView("operations")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === "operations"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                  : "text-gray-650 hover:text-gray-900"
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>Operations Control</span>
            </button>
            <button
              id="switch-worker-button"
              onClick={() => setView("worker")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentView === "worker"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                  : "text-gray-650 hover:text-gray-900"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Field Worker App</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider text-gray-400 font-mono">Ledger Treasury</span>
              <span className="text-sm font-bold font-mono text-gray-950">
                {treasuryBalance.toFixed(2)} MONAD
              </span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-right">
              <span className="block text-xs uppercase tracking-wider text-gray-400 font-mono">Contracts Board</span>
              <span className="text-sm font-bold font-mono text-gray-950">
                {activeGigsCount} Gigs Open
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
