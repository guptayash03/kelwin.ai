"use client";

export function AuthPanel() {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden border-r border-border bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e]">
      <div className="relative z-10 flex flex-col items-center gap-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          kelwin.ai
        </h2>
        <p className="text-sm text-white/50 text-center max-w-[220px]">
          AI-powered solutions for modern teams
        </p>
      </div>
    </div>
  );
}
