"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentStreamStore } from "@/lib/store";
import { useSocketEvent } from "@/lib/socket";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LiveAgentStream() {
  const { steps, addStep, clearSteps } = useAgentStreamStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useSocketEvent("agent:step", (data: {
    runId: string;
    agentType: string;
    step: string;
    output: unknown;
    timestamp: string;
  }) => {
    addStep(data);
  });

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [steps]);

  const agentColors: Record<string, string> = {
    ceo: "bg-purple-500/20 text-purple-400",
    coo: "bg-blue-500/20 text-blue-400",
    research_manager: "bg-green-500/20 text-green-400",
    outreach_manager: "bg-yellow-500/20 text-yellow-400",
    follow_up: "bg-orange-500/20 text-orange-400",
    crm_manager: "bg-pink-500/20 text-pink-400",
    browser: "bg-cyan-500/20 text-cyan-400",
    reflection: "bg-indigo-500/20 text-indigo-400",
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{steps.length} events</p>
        <button
          onClick={clearSteps}
          className="text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          Clear
        </button>
      </div>

      <div
        ref={containerRef}
        className="h-[400px] overflow-y-auto space-y-2 p-3 rounded-lg bg-black/20 font-mono text-xs"
      >
        <AnimatePresence>
          {steps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 py-1"
            >
              <span className="text-text-muted/50 shrink-0">
                {new Date(step.timestamp).toLocaleTimeString()}
              </span>
              <Badge className={cn("shrink-0", agentColors[step.agentType] ?? "bg-white/10 text-text-muted")}>
                {step.agentType}
              </Badge>
              <span className="text-text-primary">{step.step}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {steps.length === 0 && (
          <div className="flex items-center justify-center h-full text-text-muted">
            Waiting for agent activity...
          </div>
        )}
      </div>
    </div>
  );
}
