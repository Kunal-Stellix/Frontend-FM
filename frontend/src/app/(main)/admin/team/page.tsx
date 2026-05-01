"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminTeamWorkspace } from "@/components/admin/team/AdminTeamWorkspace";

export default function AdminTeamPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link href="/admin" className="btn btn-ghost btn-sm -ml-3 mb-4 text-base-content/60">
          <ChevronLeft className="h-4 w-4" />
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-base-content">Team access</h1>
        <p className="mt-2 text-base-content/60">
          Invite teammates, adjust roles, and revoke access while backend membership endpoints are
          still being finalized.
        </p>
      </div>

      <AdminTeamWorkspace showHeader={false} />
    </div>
  );
}
