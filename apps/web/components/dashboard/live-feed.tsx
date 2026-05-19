"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail, Calendar, XCircle } from "lucide-react";
import { useSocketEvent } from "@/lib/socket";
import { useState } from "react";

interface FeedItem {
  id: string;
  type: "won" | "email" | "meeting" | "lost";
  message: string;
  timestamp: Date;
}

const initialFeed: FeedItem[] = [
  { id: "1", type: "won", message: "Deal won with Acme Corp — $12,000", timestamp: new Date(Date.now() - 300000) },
  { id: "2", type: "email", message: "Email opened by John at TechStart", timestamp: new Date(Date.now() - 600000) },
  { id: "3", type: "meeting", message: "Meeting booked with Sarah at DataFlow", timestamp: new Date(Date.now() - 900000) },
  { id: "4", type: "email", message: "Reply received from Mike at CloudBase", timestamp: new Date(Date.now() - 1200000) },
  { id: "5", type: "lost", message: "Deal lost — Not interested at ScaleUp", timestamp: new Date(Date.now() - 1800000) },
];

const typeIcons = {
  won: CheckCircle,
  email: Mail,
  meeting: Calendar,
  lost: XCircle,
};

const typeColors = {
  won: "text-success",
  email: "text-primary",
  meeting: "text-warning",
  lost: "text-error",
};

export function LiveFeed() {
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);

  useSocketEvent("email:replied", (data: { emailId: string; snippet: string }) => {
    setFeed((prev) => [
      {
        id: crypto.randomUUID(),
        type: "email",
        message: `Reply: ${data.snippet.slice(0, 80)}...`,
        timestamp: new Date(),
      },
      ...prev.slice(0, 9),
    ]);
  });

  useSocketEvent("deal:updated", (data: { dealId: string; newStage: string }) => {
    if (data.newStage === "won") {
      setFeed((prev) => [
        {
          id: crypto.randomUUID(),
          type: "won",
          message: `Deal won — ${data.dealId.slice(0, 8)}`,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    }
  });

  return (
    <div className="space-y-3 max-h-[320px] overflow-y-auto">
      <AnimatePresence>
        {feed.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <Icon size={16} className={cn(typeColors[item.type], "mt-0.5 shrink-0")} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary truncate">{item.message}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  {formatTime(item.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function formatTime(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
