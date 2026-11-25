import { redirect } from "next/navigation";

export default function HomePage() {
  redirect(`/${process.env.REWIND_LATEST_EDITION ?? "2026"}`);
}
