import Link from "next/link";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { MessageRowActions, MarkAllReadButton } from "./row-actions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const sp = await searchParams;
  const filter = sp.filter ?? "all";

  let msgs: any[] = [];
  if (db) {
    try { msgs = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 200 }); } catch { /* demo */ }
  }

  const unread = msgs.filter((m) => !m.read);
  const shown = filter === "unread" ? unread : filter === "read" ? msgs.filter((m) => m.read) : msgs;

  const tab = (key: string, label: string, count?: number) => (
    <Link
      key={key}
      href={key === "all" ? "/admin/messages" : `/admin/messages?filter=${key}`}
      className={cn(
        "rounded-xl px-3.5 py-2 text-[13px] font-bold transition",
        filter === key ? "bg-navy-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-safety-600 hover:text-safety-600"
      )}
    >
      {label}{count !== undefined && count > 0 ? ` (${count})` : ""}
    </Link>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-navy-950">Contact messages ({msgs.length})</h2>
        {unread.length > 0 && <MarkAllReadButton count={unread.length} />}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tab("all", "All", msgs.length)}
        {tab("unread", "Unread", unread.length)}
        {tab("read", "Read")}
      </div>

      {shown.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          {filter === "unread" ? "No unread messages — inbox clear." : "No messages yet."}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {shown.map((m) => (
            <div key={m.id} className={cn("rounded-2xl border bg-white p-4 text-sm transition", m.read ? "border-slate-200" : "border-l-4 border-safety-600 border-y-slate-200 border-r-slate-200")}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-navy-950">
                    {!m.read && <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-safety-600" aria-label="Unread" />}
                    {m.name} <span className="font-normal text-slate-400">• {m.email}{m.phone ? ` • ${m.phone}` : ""} • {new Date(m.createdAt).toLocaleString()}</span>
                  </p>
                  {m.subject && <p className="mt-0.5 font-semibold text-slate-600">Subject: {m.subject}</p>}
                </div>
                <MessageRowActions id={m.id} read={m.read} />
              </div>
              <p className="mt-1.5 text-slate-600">{m.message}</p>
              <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject || "Your enquiry to SAFETYPRO AFRICA"))}`} className="mt-2 inline-flex text-[13px] font-bold text-safety-600 hover:text-accent-600">
                Reply by email →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
