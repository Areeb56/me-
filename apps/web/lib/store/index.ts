import { create } from "zustand";
import { AgentStatus, KpiMetrics } from "@aios/shared-types";

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}));

interface AgentStreamState {
  steps: Array<{
    id: string;
    runId: string;
    agentType: string;
    step: string;
    output: unknown;
    timestamp: string;
  }>;
  addStep: (step: AgentStreamState["steps"][number]) => void;
  clearSteps: () => void;
}

export const useAgentStreamStore = create<AgentStreamState>((set) => ({
  steps: [],
  addStep: (step) =>
    set((state) => ({
      steps: [...state.steps.slice(-100), { ...step, id: crypto.randomUUID() }],
    })),
  clearSteps: () => set({ steps: [] }),
}));

interface DashboardState {
  metrics: KpiMetrics | null;
  setMetrics: (metrics: KpiMetrics) => void;
  agentStatuses: AgentStatus[];
  setAgentStatuses: (statuses: AgentStatus[]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  setMetrics: (metrics) => set({ metrics }),
  agentStatuses: [],
  setAgentStatuses: (statuses) => set({ agentStatuses: statuses }),
}));
