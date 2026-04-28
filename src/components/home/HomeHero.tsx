import {
  Button,
  Card,
  CardBody,
  CommentThreadItem,
  Dialog,
  EmptyState,
  FeedbackAvatar,
  FeedbackCard,
} from "@/components/ui";

export function HomeHero() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
      <section className="hero overflow-hidden rounded-[2rem] border border-base-300 bg-gradient-to-br from-base-100 via-base-100 to-primary/10 shadow-sm">
        <div className="hero-content flex-col items-start gap-10 px-6 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="max-w-2xl">
            <span className="badge badge-outline badge-primary badge-lg">Reusable DaisyUI templates</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-base-content lg:text-5xl">
              Build feedback screens faster with a ready-made UI kit.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-base-content/70">
              These components are shaped around feedback triage, discussion, and delivery
              flows so we can reuse them across ideas, roadmap, changelog, and settings pages.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button>Use in ideas flow</Button>
              <Button variant="outline">Extend the kit</Button>
            </div>
          </div>

          <Card className="w-full max-w-xl border border-base-300 bg-base-100/90 shadow-xl backdrop-blur">
            <CardBody className="gap-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                    Team snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Product feedback squad</h2>
                </div>
                <div className="avatar-group -space-x-4">
                  <FeedbackAvatar name="Nina Patel" size="md" presence="online" />
                  <FeedbackAvatar name="Owen Reed" size="md" presence="away" />
                  <FeedbackAvatar name="Mira Chen" size="md" presence="busy" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-base-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-base-content/60">Open ideas</p>
                  <p className="mt-2 text-3xl font-bold text-base-content">148</p>
                </div>
                <div className="rounded-2xl bg-base-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-base-content/60">In review</p>
                  <p className="mt-2 text-3xl font-bold text-base-content">27</p>
                </div>
                <div className="rounded-2xl bg-base-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-base-content/60">Released</p>
                  <p className="mt-2 text-3xl font-bold text-base-content">11</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <FeedbackCard
          title="Support teams need customer-impact summaries on each idea"
          summary="Add a concise business impact field so reviewers can understand urgency without digging through comment history or CRM notes."
          status="under-review"
          author="Nina Patel"
          team="Support ops"
          updatedAt="2h ago"
          votes={42}
          comments={16}
        />

        <Card className="border border-base-300 shadow-sm">
          <CardBody className="gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Thread template
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-base-content">Comment activity</h2>
            </div>

            <CommentThreadItem
              author="Mira Chen"
              role="Product manager"
              postedAt="Today at 10:24"
              message="We should surface the affected segment next to each request so prioritization stays grounded in customer impact."
              presence="online"
              highlighted
            />
            <CommentThreadItem
              author="Owen Reed"
              role="Engineer"
              postedAt="Today at 11:02"
              message="This template will also work for roadmap notes if we keep the message slot plain text and let the parent page decide actions."
              presence="away"
            />
          </CardBody>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <EmptyState
          title="No changelog highlights yet"
          description="Use this block whenever a list is empty and you want to keep the page feeling intentional instead of unfinished."
          action={<Button variant="outline">Create first update</Button>}
        />

        <div className="relative min-h-[28rem] overflow-hidden rounded-[2rem] border border-base-300 bg-base-200/40 p-4">
          <Dialog
            title="Ship release note draft?"
            description="This dialog template works for confirmations, approval flows, and quick-edit forms across the feedback management system."
            preview
            actions={
              <>
                <button className="btn btn-ghost">Cancel</button>
                <button className="btn btn-primary">Publish note</button>
              </>
            }
            className="!absolute !inset-0"
          >
            <div className="space-y-4">
              <label className="form-control">
                <span className="label-text mb-2 font-medium">Summary</span>
                <input
                  className="input input-bordered w-full"
                  defaultValue="Improved feedback triage with reusable templates."
                />
              </label>
              <label className="form-control">
                <span className="label-text mb-2 font-medium">Audience</span>
                <select className="select select-bordered w-full" defaultValue="customers">
                  <option value="customers">Customers</option>
                  <option value="internal">Internal team</option>
                  <option value="beta">Beta program</option>
                </select>
              </label>
            </div>
          </Dialog>
        </div>
      </section>
    </main>
  );
}
