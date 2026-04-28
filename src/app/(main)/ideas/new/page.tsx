import Link from "next/link";
import { Button, Card, CardBody, CardTitle, FieldLabel, FormField, Input } from "@/components/ui";

export default function NewIdeaPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Feedback intake
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Share a new idea</h1>
          <p className="mt-3 text-gray-600">
            Capture the problem, the audience, and the impact so the team can triage it quickly.
          </p>
        </div>

        <Link href="/ideas" className="btn btn-ghost">
          Back to ideas
        </Link>
      </div>

      <Card className="mt-10 border border-base-300 shadow-sm">
        <CardBody className="gap-6">
          <div>
            <CardTitle>Idea brief</CardTitle>
            <p className="mt-2 text-sm text-gray-500">
              This page is ready for wiring into your backend when you want to persist submissions.
            </p>
          </div>

          <form className="grid gap-5">
            <FormField>
              <FieldLabel helper="Required">Title</FieldLabel>
              <Input placeholder="Summarize the feedback in one sentence" />
            </FormField>

            <FormField>
              <FieldLabel>Category</FieldLabel>
              <select className="select select-bordered w-full" defaultValue="">
                <option value="" disabled>
                  Select a category
                </option>
                <option>Bug report</option>
                <option>Feature request</option>
                <option>UX improvement</option>
                <option>Workflow pain point</option>
              </select>
            </FormField>

            <FormField>
              <FieldLabel helper="Required">Description</FieldLabel>
              <textarea
                className="textarea textarea-bordered min-h-36 w-full"
                placeholder="What are users asking for, and what problem does it solve?"
              />
            </FormField>

            <FormField>
              <FieldLabel>Customer context</FieldLabel>
              <Input placeholder="Which customer, segment, or team requested this?" />
            </FormField>

            <FormField>
              <FieldLabel>Expected impact</FieldLabel>
              <Input placeholder="Retention, activation, support load, revenue, or other outcome" />
            </FormField>

            <div className="flex flex-col gap-3 border-t border-base-300 pt-2 sm:flex-row sm:justify-end">
              <Link href="/ideas" className="btn btn-outline">
                Cancel
              </Link>
              <Button type="submit">Submit idea</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </section>
  );
}
