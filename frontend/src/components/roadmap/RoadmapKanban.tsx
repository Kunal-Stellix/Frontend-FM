"use client";

import { useEffect, useState } from "react";
import { fetchRoadmap } from "@/lib/feedbackApi";
import type { RoadmapItem } from "@/types/idea";
import { RoadmapColumn } from "./RoadmapColumn";
import { DetailDrawer } from "./DetailDrawer";
import { Map } from "lucide-react";

export function RoadmapKanban() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);

  useEffect(() => {
    let active = true;

    const loadRoadmap = async () => {
      try {
        const data = await fetchRoadmap();
        if (active) {
          setItems(data);
        }
      } catch {
        if (active) {
          setError("Failed to load roadmap data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadRoadmap();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 w-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 w-full text-error font-medium">
        {error}
      </div>
    );
  }

  const plannedItems = items.filter((item) => item.status === "planned");
  const inProgressItems = items.filter((item) => item.status === "in_progress");
  const shippedItems = items.filter((item) => item.status === "shipped");

  return (
    <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Map className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Roadmap
          </span>
        </div>
        <h1 className="text-3xl font-bold text-base-content">
          What&apos;s coming next?
        </h1>
        <p className="mt-2 text-base-content/60 max-w-2xl">
          See what we&apos;re working on and what we&apos;ve recently shipped. Click any item to view more details.
        </p>
      </div>

      {/* Kanban Board Container */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 h-[calc(100vh-250px)] min-h-[500px]">
        <div className="flex-1 min-w-[300px]">
          <RoadmapColumn
            title="Planned"
            colorClass="bg-info"
            items={plannedItems}
            onItemClick={setSelectedItem}
          />
        </div>
        <div className="flex-1 min-w-[300px]">
          <RoadmapColumn
            title="In Progress"
            colorClass="bg-accent"
            items={inProgressItems}
            onItemClick={setSelectedItem}
          />
        </div>
        <div className="flex-1 min-w-[300px]">
          <RoadmapColumn
            title="Shipped"
            colorClass="bg-success"
            items={shippedItems}
            onItemClick={setSelectedItem}
          />
        </div>
      </div>

      <DetailDrawer
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
