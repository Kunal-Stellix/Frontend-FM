"use client";

import { ProfileWorkspace } from "@/components/profile/ProfileWorkspace";

export default function ProfilePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <ProfileWorkspace />
    </section>
  );
}
