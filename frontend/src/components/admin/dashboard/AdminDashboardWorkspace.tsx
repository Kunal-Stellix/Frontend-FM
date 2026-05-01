"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminDashboard } from "@/lib/feedbackApi";
import type { AdminDashboard } from "@/types/admin";
import { Users, Activity, ListTodo, ChevronRight, Link2, KeyRound, Palette } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { hasStoredSession } from "@/lib/authStorage";

export function AdminDashboardWorkspace() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthorized = hasStoredSession();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const dashboardData = await fetchAdminDashboard();
        if (active) setData(dashboardData);
      } catch {
        if (active) setError("Failed to load dashboard data. Are you an admin?");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (isAuthorized) {
      Promise.resolve().then(loadData);
    }

    return () => {
      active = false;
    };
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-error">Unauthorized access.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-error">{error}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>
          <p className="mt-1 text-base-content/60">Platform overview and moderation queue.</p>
        </div>
        <Link href="/admin/ideas" className="btn btn-primary">
          Manage Ideas <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-base-200 bg-base-100 p-6 shadow-sm">
          <div className="rounded-xl bg-warning/10 p-4 text-warning">
            <ListTodo className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/60">Under Review</p>
            <p className="text-2xl font-bold text-base-content">{data.queueCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-base-200 bg-base-100 p-6 shadow-sm">
          <div className="rounded-xl bg-primary/10 p-4 text-primary">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/60">Total Ideas</p>
            <p className="text-2xl font-bold text-base-content">
              {data.topIdeas.length > 0 ? "Active" : "0"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-base-200 bg-base-100 p-6 shadow-sm">
          <div className="rounded-xl bg-success/10 p-4 text-success">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-base-content/60">Activities</p>
            <p className="text-2xl font-bold text-base-content">{data.activityFeed.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-bold text-base-content">Top Ideas</h2>
          <div className="overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-base-200/50">
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Votes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-base-200/20">
                      <td className="font-medium text-base-content">
                        <Link
                          href={`/feedback/${idea.id}`}
                          className="transition-colors hover:text-primary"
                        >
                          {idea.title}
                        </Link>
                      </td>
                      <td>
                        <StatusBadge status={idea.status} />
                      </td>
                      <td className="font-bold">{idea.voteCount}</td>
                      <td>
                        <Link href={`/admin/ideas?id=${idea.id}`} className="btn btn-ghost btn-xs">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data.topIdeas.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-base-content/50">
                        No ideas found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-base-content">Recent Activity</h2>
          <div className="rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm">
            {data.activityFeed.length === 0 ? (
              <p className="py-4 text-center text-sm text-base-content/50">No recent activity.</p>
            ) : (
              <ul className="space-y-4">
                {data.activityFeed.map((activity) => (
                  <li key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"></div>
                    <div>
                      <p className="text-sm text-base-content">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="mt-0.5 text-xs text-base-content/50">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/settings"
          className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <Palette className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base-content">Brand settings</h3>
          <p className="mt-1 text-sm text-base-content/60">Portal name, logo, and brand color.</p>
        </Link>
        <Link
          href="/admin/team"
          className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <Users className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base-content">Team access</h3>
          <p className="mt-1 text-sm text-base-content/60">
            Invite, role assignment, and revoke flows.
          </p>
        </Link>
        <Link
          href="/admin/webhooks"
          className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <Link2 className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base-content">Webhooks</h3>
          <p className="mt-1 text-sm text-base-content/60">Manage outbound event destinations.</p>
        </Link>
        <Link
          href="/admin/apikeys"
          className="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
        >
          <KeyRound className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base-content">API keys</h3>
          <p className="mt-1 text-sm text-base-content/60">Generate and revoke integration keys.</p>
        </Link>
      </div>
    </div>
  );
}
