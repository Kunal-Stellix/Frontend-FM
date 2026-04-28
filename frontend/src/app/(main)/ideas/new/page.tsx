import { redirect } from "next/navigation";

export default function NewIdeaPage() {
  redirect("/ideas?compose=1");
}
