"use client";

import type { TeamMember, TeamRole } from "@/types/admin";

type TeamMembersTableProps = {
  members: TeamMember[];
  onRoleChange: (memberId: string, role: TeamRole) => Promise<void>;
  onRevoke: (memberId: string) => Promise<void>;
};

const formatActivity = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "No activity yet";

export function TeamMembersTable({ members, onRoleChange, onRevoke }: TeamMembersTableProps) {
  return (
    <div className="rounded-3xl border border-base-300 bg-base-100 shadow-sm">
      <div className="border-b border-base-300 px-6 py-5">
        <h2 className="text-xl font-bold text-base-content">Team access</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Status</th>
              <th>Role</th>
              <th>Last active</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>
                  <div>
                    <p className="font-semibold text-base-content">{member.name}</p>
                    <p className="text-sm text-base-content/60">{member.email}</p>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge badge-sm ${
                      member.status === "active"
                        ? "badge-success"
                        : member.status === "pending"
                          ? "badge-warning"
                          : "badge-error"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
                <td>
                  <select
                    value={member.role}
                    className="select select-bordered select-sm w-full max-w-[140px]"
                    onChange={(event) => onRoleChange(member.id, event.target.value as TeamRole)}
                    disabled={member.status === "revoked"}
                  >
                    <option value="member">Member</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="text-sm text-base-content/60">{formatActivity(member.lastActiveAt)}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    disabled={member.status === "revoked"}
                    onClick={() => onRevoke(member.id)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}

            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-base-content/50">
                  No teammates yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
