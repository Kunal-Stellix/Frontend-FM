"use client";

import { useState } from "react";
import type { TeamRole } from "@/types/admin";

type InviteMemberFormProps = {
  onInvite: (payload: { email: string; role: TeamRole }) => Promise<void>;
};

export function InviteMemberForm({ onInvite }: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("member");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      await onInvite({ email: email.trim(), role });
      setEmail("");
      setRole("member");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-base-300 bg-base-100 p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-base-content">Add teammate</h2>
        <p className="text-sm text-base-content/60">
          Add members directly and assign their final role immediately, including admin access.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px_auto]">
        <label className="form-control">
          <span className="mb-2 text-sm font-medium text-base-content">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="input input-bordered"
            placeholder="teammate@company.com"
            required
          />
        </label>

        <label className="form-control">
          <span className="mb-2 text-sm font-medium text-base-content">Role</span>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as TeamRole)}
            className="select select-bordered"
          >
            <option value="member">Member</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? "Adding..." : "Add member"}
          </button>
        </div>
      </div>
    </form>
  );
}
