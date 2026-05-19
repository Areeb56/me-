"use client";

import { Search, Bell, Command } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function Topbar() {
  const { setCommandPaletteOpen } = useAppStore();

  return (
    <header className="h-14 border-b border-white/5 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-text-muted hover:text-text-primary hover:border-white/20 transition-all text-sm"
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd className="ml-4 px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">
            <Command size={10} />
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">K</kbd>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-text-muted">Ollama</span>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
      </div>
    </header>
  );
}
