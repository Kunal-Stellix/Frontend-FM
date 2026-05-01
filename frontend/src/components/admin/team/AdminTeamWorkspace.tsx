"use client";

import { useEffect, useState } from "react";
import {
  fetchTeamMembers,
  inviteTeamMember,
  revokeTeamMemberAccess,
  updateTeamMemberRole,
} from "@/lib/feedbackApi";
import type { TeamMember, TeamRole } from "@/types/admin";
import { InviteMemberForm } from "@/components/admin/team/InviteMemberForm";
import { TeamMembersTable } from "@/components/admin/team/TeamMembersTable";

export function AdminTeamWorkspace({ showHeader = true }: { showHeader?: boolean } = {}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const response = await fetchTeamMembers();
        if (active) setMembers(response);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load team members.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const handleInvite = async (payload: { email: string; role: TeamRole }) => {
    const nextMember = await inviteTeamMember(payload);
    setMembers((current) => [nextMember, ...current]);
  };

  const handleRoleChange = async (memberId: string, role: TeamRole) => {
    const previousMembers = members;
    setMembers((current) =>
      current.map((member) => (member.id === memberId ? { ...member, role } : member)),
    );

    try {
      await updateTeamMemberRole(memberId, role);
    } catch (roleError) {
      setMembers(previousMembers);
      setError(roleError instanceof Error ? roleError.message : "Failed to update role.");
    }
  };

  const handleRevoke = async (memberId: string) => {
    if (!window.confirm("Revoke this team member's access?")) return;

    const previousMembers = members;
    setMembers((current) =>
      current.map((member) =>
        member.id === memberId ? { ...member, status: "revoked", lastActiveAt: null } : member,
      ),
    );

    try {
      await revokeTeamMemberAccess(memberId);
    } catch (revokeError) {
      setMembers(previousMembers);
      setError(revokeError instanceof Error ? revokeError.message : "Failed to revoke access.");
    }
  };

  return (
    <div className="space-y-6">
      {showHeader ? (
        <div>
          <h1 className="text-3xl font-bold text-base-content">Team access</h1>
          <p className="mt-2 text-base-content/60">
            Invite teammates, adjust roles, and revoke access while backend membership endpoints
            are still being finalized.
          </p>
        </div>
      ) : null}

      <InviteMemberForm onInvite={handleInvite} />

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      ) : (
        <TeamMembersTable
          members={members}
          onRoleChange={handleRoleChange}
          onRevoke={handleRevoke}
        />
      )}
    </div>
  );
}
