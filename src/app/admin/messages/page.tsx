import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  let msgs: any[] = [];
  if (db) {
    try { msgs = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 }); } catch { /* demo */ }
  }
  return (
    <div>
      <h2 className="text-lg font-extrabold text-navy-950">Contact messages ({msgs.length})</h2>
      {msgs.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No messages yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-bold text-navy-950">{m.name} <span className="font-normal text-slate-400">• {m.email}{m.phone ? ` • ${m.phone}` : ""} • {new Date(m.createdAt).toLocaleString()}</span></p>
              {m.subject && <p className="mt-0.5 font-semibold text-slate-600">Subject: {m.subject}</p>}
              <p className="mt-1.5 text-slate-600">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
