"use client";

import { useState } from "react";
import { Users, User, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PeersPanelProps {
  totalPeers: number;
  peerNames: string[];
}

export function PeersPanel({ totalPeers, peerNames }: PeersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="bg-card/90 backdrop-blur-md shadow-lg min-w-[200px]">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">
            Users ({totalPeers})
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </Button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5 max-h-[200px] overflow-y-auto border-t">
          {peerNames.map((name, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="truncate">{name}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
