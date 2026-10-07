import type { Metadata } from "next";
import { Award, CheckCircle2, ClipboardList, Factory, Flame, GraduationCap, HardHat, HeartPulse, Mail, Phone, Truck, type LucideIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/ui";
import { TrainingForm } from "./TrainingForm";

export const metadata: Metadata = {
  title: "Corporate Safety Training Kenya",
  description: "On-site corporate safety training across Kenya: first aid, fire safety, work at height, PPE use, HSE induction and chemical handling — with certificates and records for every trainee.",
  alternates: { canonical: "/training" },
};

const COURSES = [
  { name: "First Aid at Work", duration: "2 days", blurb: "Scene safety, CPR, bleeding, burns, fractures and incident records — matched to the first-aid kits you stock on site.", icon: HeartPulse },
  { name: "Fire Safety & Extinguisher Handling", duration: "1 day", blurb: "Fire classes, PASS technique with live extinguisher practice, alarms, assembly points and evacuation roles.", icon: Flame },
  { name: "Work at Height & Fall Protection", duration: "1–2 days", blurb: "Harness fitting, anchor points, lanyards and rescue planning for roofs, scaffolds and structures.", icon: HardHat },
  { name: "PPE Selection, Use & Maintenance", duration: "Half day", blurb: "Right gear for each hazard, correct fitting, inspection routines and replacement schedules per role.", icon: ClipboardList },
  { name: "HSE Induction for Supervisors", duration: "1 day", blurb: "Toolbox talks, permits, incident reporting, audits and the supervisor's duties under Kenyan safety law.", icon: Factory },
  { name: "Chemical Handling & Spill Response", duration: "1 day", blurb: "Labels and SDS, storage and segregation, PPE for spraying and cleaning, spill kits and decontamination.", icon: Award },
];

export default function TrainingPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Safety Training" }]} />
      {/* hero */}
      <div className="border-b border-slate-200 bg-navy-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-accent-500 ring-1 ring-white/15">
            <GraduationCap size={14} /> Corporate safety training
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">Train the Team Behind the PPE</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-300">
            Practical, on-site safety courses for Kenyan workplaces — construction crews, factories, flower farms,
            warehouses and institutions. Delivered at your site, in your shifts, with certificates and training records for every trainee.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              ["On-site delivery", "We come to your site, anywhere in Kenya", Truck],
              ["Certificates issued", "Completion certificates + attendance records", Award],
              ["Shift-friendly", "Weekday, weekend and night-shift sessions", ClipboardList],
              ["PPE bundled in", "Course-matched gear quotes for every trainee", HardHat],
            ] as [string, string, LucideIcon][]).map(([t, d, Icon]) => (
              <div key={t} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                <Icon size={20} className="text-accent-500" />
                <p className="mt-2 text-sm font-extrabold text-white">{t}</p>
                <p className="mt-0.5 text-[12.5px] text-slate-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* courses */}
        <h2 className="text-xl font-extrabold text-navy-950 sm:text-2xl">Courses for working crews</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">Six core courses, each adapted to your industry, hazards and group size. Need something else? Describe it in the request form.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c) => (
            <div key={c.name} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-950 text-accent-500"><c.icon size={20} /></span>
              <h3 className="mt-3 font-extrabold text-navy-950">{c.name}</h3>
              <p className="mt-0.5 text-[12px] font-bold uppercase tracking-widest text-safety-600">{c.duration} • On-site</p>
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-600">{c.blurb}</p>
              <a href="#request-training" className="mt-4 text-sm font-bold text-safety-600 hover:text-accent-600">Request this course →</a>
            </div>
          ))}
        </div>

        {/* process */}
        <h2 className="mt-12 text-xl font-extrabold text-navy-950 sm:text-2xl">How it works</h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Request training", "Pick a course, group size and preferred dates."],
            ["02", "Needs call", "We confirm hazards, shifts, language and venue."],
            ["03", "On-site delivery", "Trainers come to you with all practice gear."],
            ["04", "Certificates & records", "Per-trainee certificates and a file for audits."],
          ].map(([n, t, d]) => (
            <li key={n} className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="text-xs font-extrabold tracking-widest text-accent-600">{n}</p>
              <p className="mt-1 font-extrabold text-navy-950">{t}</p>
              <p className="mt-1 text-[13px] text-slate-600">{d}</p>
            </li>
          ))}
        </ol>

        {/* form + aside */}
        <div id="request-training" className="mt-10 grid scroll-mt-32 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 className="text-xl font-extrabold text-navy-950">Request corporate training</h2>
            <p className="mt-1 text-sm text-slate-600">Complete the form — our training desk responds within one business day.</p>
            <div className="mt-4"><TrainingForm /></div>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
            <div className="rounded-xl bg-navy-950 p-6 text-white">
              <h3 className="font-extrabold">Talk to the training desk</h3>
              <div className="mt-4 space-y-3 text-sm">
                <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Phone size={17} /></span><span><strong className="block text-white">0715 135 141</strong><span className="text-slate-400">Mon–Sat, 8am–6pm EAT</span></span></p>
                <p className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-accent-500"><Mail size={17} /></span><span><strong className="block text-white">sales@safetypro.co.ke</strong><span className="text-slate-400">Course outlines & proposals</span></span></p>
              </div>
              <div className="mt-5 rounded-lg bg-white/[0.06] p-4 text-[13px] text-slate-300 ring-1 ring-white/10">
                <p className="font-extrabold text-white">Every booking includes</p>
                <ul className="mt-2 space-y-1.5">
                  {["Needs assessment before training day", "Practice equipment brought to site", "Per-trainee certificate + attendance file"].map((t) => (
                    <li key={t} className="flex gap-2"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" /> {t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-mist p-6">
              <h3 className="font-extrabold text-navy-950">Training + PPE bundles</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">Kit every trainee in one order — course-matched PPE packs with volume pricing and a single VAT invoice.</p>
              <a href="/bulk-ppe" className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-navy-950 py-3 text-sm font-bold text-white hover:bg-safety-600">Get a bundle quote</a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
