import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ImageOff, Layers, PenLine, RefreshCw, Search, Stethoscope, Building, FileText, Eraser } from "lucide-react";
import { apiClient } from "../api";
import { PLACEHOLDER_AUTHORS, toBn } from "../lib/catalog";

interface HealthBook {
  id: string;
  code: string;
  name: string;
  author: string;
  publisher: string;
  group: string;
  status: string;
  imageState: "ok" | "none" | "invalid";
  hasDescription: boolean;
}

type IssueKey = "noGroup" | "invalidImage" | "noImage" | "noDescription" | "noAuthor" | "noPublisher";

const isPlaceholder = (v?: string) => PLACEHOLDER_AUTHORS.has((v || "").trim().toLowerCase());

const ISSUES: { key: IssueKey; label: string; hint: string; icon: React.ElementType; test: (b: HealthBook) => boolean }[] = [
  { key: "noGroup", label: "কর্নার নেই", hint: "কোনো কর্নারে রাখা হয়নি — ক্যাটালগে বিভাগ অনুযায়ী দেখা যায় না", icon: Layers, test: (b) => !b.group.trim() },
  { key: "invalidImage", label: "অকেজো কভার মান", hint: "ছবির জায়গায় ছবি নয় এমন কিছু (যেমন \"200\") লেখা", icon: AlertTriangle, test: (b) => b.imageState === "invalid" },
  { key: "noImage", label: "কভার ছবি নেই", hint: "কোনো ছবি নেই — সাইটে স্বয়ংক্রিয় নকশার কভার দেখানো হয়", icon: ImageOff, test: (b) => b.imageState !== "ok" },
  { key: "noDescription", label: "বিবরণ নেই", hint: "বইয়ের পাতায় কোনো বিবরণ দেখানো যায় না", icon: FileText, test: (b) => !b.hasDescription },
  { key: "noAuthor", label: "লেখক অনির্দিষ্ট", hint: "লেখকের নাম ফাঁকা বা \"উল্লেখ নেই\"/\"নাই\"", icon: PenLine, test: (b) => isPlaceholder(b.author) },
  { key: "noPublisher", label: "প্রকাশনী অনির্দিষ্ট", hint: "প্রকাশনী ফাঁকা বা \"নাই\"", icon: Building, test: (b) => isPlaceholder(b.publisher) },
];

const ROWS_STEP = 100;

export default function DataHealth({ onRefreshStats }: { onRefreshStats?: () => void }) {
  const [books, setBooks] = useState<HealthBook[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [issue, setIssue] = useState<IssueKey>("noGroup");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [targetGroup, setTargetGroup] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [rowLimit, setRowLimit] = useState(ROWS_STEP);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [health, groupsRes] = await Promise.all([
        apiClient.get("/admin/books/health"),
        apiClient.get("/public/groups").catch(() => null),
      ]);
      setBooks(health.books || []);
      setGroups(Array.isArray(groupsRes?.groups) ? groupsRes.groups : []);
    } catch (err: any) {
      setError(err.message || "ডেটা লোড করা যায়নি।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c = {} as Record<IssueKey, number>;
    for (const i of ISSUES) c[i.key] = books.filter(i.test).length;
    return c;
  }, [books]);

  // Share of the checks (corner, cover, description, author, publisher) that pass across the catalogue.
  const completeness = useMemo(() => {
    if (!books.length) return 0;
    const checks = ["noGroup", "noImage", "noDescription", "noAuthor", "noPublisher"] as IssueKey[];
    const failing = checks.reduce((sum, k) => sum + counts[k], 0);
    return Math.round(100 * (1 - failing / (books.length * checks.length)));
  }, [books, counts]);

  const allGroups = useMemo(
    () => Array.from(new Set([...groups, ...books.map((b) => b.group).filter(Boolean)])).sort((a, b) => a.localeCompare(b, "bn")),
    [groups, books]
  );

  const activeIssue = ISSUES.find((i) => i.key === issue)!;
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter(activeIssue.test).filter((b) =>
      !q || [b.name, b.author, b.publisher, b.code].some((f) => (f || "").toLowerCase().includes(q))
    );
  }, [books, activeIssue, query]);

  const authorsInView = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of rows) if (!isPlaceholder(b.author)) m.set(b.author.trim(), (m.get(b.author.trim()) || 0) + 1);
    return Array.from(m.entries()).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, [rows]);

  const changeIssue = (key: IssueKey) => {
    setIssue(key);
    setSelected(new Set());
    setRowLimit(ROWS_STEP);
    setMessage(null);
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allVisibleSelected = rows.length > 0 && rows.every((b) => selected.has(b.id));
  const toggleAll = () => setSelected(allVisibleSelected ? new Set() : new Set(rows.map((b) => b.id)));
  const selectAuthor = (author: string) =>
    setSelected((prev) => new Set([...prev, ...rows.filter((b) => b.author.trim() === author).map((b) => b.id)]));

  const assignGroup = async () => {
    const groupName = targetGroup.trim();
    if (!groupName || selected.size === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      await apiClient.put("/books/bulk-group", { bookIds: Array.from(selected), groupName });
      if (!groups.includes(groupName)) await apiClient.post("/settings/groups", { groupName }).catch(() => {});
      setMessage({ kind: "ok", text: `${toBn(selected.size)}টি বই "${groupName}"-এ রাখা হয়েছে।` });
      setSelected(new Set());
      await load();
      onRefreshStats?.();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "কর্নার আপডেট করা যায়নি।" });
    } finally {
      setBusy(false);
    }
  };

  const clearInvalidImages = async () => {
    if (!window.confirm(`${toBn(counts.invalidImage)}টি বইয়ের অকেজো কভার মান মুছে ফেলা হবে। এগুলো ছবি নয়, তাই কোনো ছবি হারাবে না। চালিয়ে যাবেন?`)) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await apiClient.post("/admin/books/clear-invalid-images", {});
      setMessage({ kind: "ok", text: `${toBn(res.cleared || 0)}টি অকেজো কভার মান মুছে ফেলা হয়েছে।` });
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "মুছতে সমস্যা হয়েছে।" });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-[#22242A] mb-4 h-10 w-10" />
        <span className="text-[#6B6B70] font-semibold">ক্যাটালগের ডেটা যাচাই হচ্ছে...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#E5E5EA] bg-white p-8 text-center">
        <p className="font-bold text-[#22242A]">{error}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-[#22242A] px-4 py-2 text-sm font-bold text-white">আবার চেষ্টা করুন</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + score */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-[#22242A]">
            <Stethoscope size={22} /> ক্যাটালগের ডেটা স্বাস্থ্য
          </h2>
          <p className="mt-1 text-sm text-[#6B6B70]">
            যে বইগুলোর তথ্য অসম্পূর্ণ, সেগুলো এক জায়গায় — ঠিক করলে পাবলিক ক্যাটালগ আরও সমৃদ্ধ দেখাবে।
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl bg-white border border-[#E5E5EA] px-5 py-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-[#22242A]"
            style={{ background: `conic-gradient(#10B981 ${completeness * 3.6}deg, #EEECEA 0deg)` }}
            aria-hidden
          >
            <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center">{toBn(completeness)}%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B6B70]">তথ্যের সম্পূর্ণতা</p>
            <p className="text-sm font-bold text-[#22242A]">{toBn(books.length)}টি বই যাচাই করা হয়েছে</p>
          </div>
          <button onClick={load} className="ml-2 p-2 rounded-lg hover:bg-[#F5F3EF]" aria-label="আবার যাচাই করুন" title="আবার যাচাই করুন">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Issue cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {ISSUES.map(({ key, label, icon: Icon }) => {
          const n = counts[key];
          const active = key === issue;
          return (
            <button
              key={key}
              onClick={() => changeIssue(key)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                active ? "bg-[#22242A] border-[#22242A] text-white shadow-lg" : "bg-white border-[#E5E5EA] hover:border-[#22242A]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon size={18} className={active ? "text-white/80" : n ? "text-amber-600" : "text-emerald-600"} />
                {n === 0 && <CheckCircle2 size={16} className={active ? "text-emerald-300" : "text-emerald-600"} />}
              </div>
              <p className="mt-3 text-2xl font-black">{toBn(n)}</p>
              <p className={`text-xs font-bold ${active ? "text-white/70" : "text-[#6B6B70]"}`}>{label}</p>
            </button>
          );
        })}
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-bold ${message.kind === "ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      {/* Issue panel */}
      <div className="rounded-2xl border border-[#E5E5EA] bg-white">
        <div className="p-4 md:p-5 border-b border-[#E5E5EA] flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="font-bold text-[#22242A]">{activeIssue.label} — {toBn(rows.length)}টি বই</p>
            <p className="text-xs text-[#6B6B70] mt-0.5">{activeIssue.hint}</p>
          </div>
          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B70]" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setRowLimit(ROWS_STEP); }}
              placeholder="নাম, লেখক বা কোড দিয়ে খুঁজুন"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E5EA] bg-[#F7F6F3] text-sm focus:outline-none focus:border-[#22242A]"
            />
          </div>
        </div>

        {/* Issue-specific actions */}
        {issue === "invalidImage" && counts.invalidImage > 0 && (
          <div className="p-4 md:p-5 border-b border-[#E5E5EA] bg-amber-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-[#22242A]">
              এই মানগুলো ছবি নয়, তাই সাইটে কোনো কাজে আসে না। মুছে দিলে বইগুলোতে স্বয়ংক্রিয় নকশার কভার দেখাবে; পরে আসল ছবি যোগ করা যাবে।
            </p>
            <button
              onClick={clearInvalidImages}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#22242A] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              <Eraser size={15} /> সবগুলো মুছে দিন
            </button>
          </div>
        )}

        {issue === "noGroup" && rows.length > 0 && (
          <div className="p-4 md:p-5 border-b border-[#E5E5EA] bg-[#F7F6F3] space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <span className="text-sm font-bold text-[#22242A] shrink-0">{toBn(selected.size)}টি নির্বাচিত →</span>
              <input
                list="data-health-groups"
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                placeholder="কর্নার বেছে নিন বা নতুন নাম লিখুন"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-[#E5E5EA] bg-white text-sm focus:outline-none focus:border-[#22242A]"
              />
              <datalist id="data-health-groups">
                {allGroups.map((g) => <option key={g} value={g} />)}
              </datalist>
              <button
                onClick={assignGroup}
                disabled={busy || selected.size === 0 || !targetGroup.trim()}
                className="shrink-0 rounded-xl bg-[#22242A] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
              >
                কর্নারে রাখুন
              </button>
            </div>
            {authorsInView.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="shrink-0 text-xs font-bold text-[#6B6B70]">লেখক ধরে নির্বাচন:</span>
                {authorsInView.map(([name, n]) => (
                  <button
                    key={name}
                    onClick={() => selectAuthor(name)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-[#E5E5EA] bg-white px-3 py-1.5 text-xs font-bold text-[#22242A] hover:border-[#22242A]/40"
                  >
                    {name} <span className="text-[#6B6B70]">{toBn(n)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(issue === "noImage" || issue === "noDescription" || issue === "noAuthor" || issue === "noPublisher") && rows.length > 0 && (
          <p className="px-4 md:px-5 py-3 border-b border-[#E5E5EA] text-xs text-[#6B6B70]">
            এগুলো ঠিক করতে "বই ক্যাটালগ" ট্যাবে বইটি খুঁজে সম্পাদনা করুন — বইয়ের কোড দিয়ে খুঁজলে দ্রুত পাবেন।
          </p>
        )}

        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
            <p className="mt-3 font-bold text-[#22242A]">এই বিভাগে কোনো সমস্যা নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-[#6B6B70] border-b border-[#E5E5EA]">
                  {issue === "noGroup" && (
                    <th className="px-4 py-3 w-10">
                      <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="সব নির্বাচন" className="w-4 h-4 accent-[#22242A]" />
                    </th>
                  )}
                  <th className="px-4 py-3 font-bold">কোড</th>
                  <th className="px-4 py-3 font-bold">বইয়ের নাম</th>
                  <th className="px-4 py-3 font-bold">লেখক</th>
                  <th className="px-4 py-3 font-bold hidden md:table-cell">প্রকাশনী</th>
                  <th className="px-4 py-3 font-bold hidden lg:table-cell">কর্নার</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, rowLimit).map((b) => (
                  <tr
                    key={b.id}
                    className={`border-b border-[#F0EFEC] last:border-0 ${selected.has(b.id) ? "bg-[#22242A]/[0.04]" : "hover:bg-[#F7F6F3]"}`}
                    onClick={issue === "noGroup" ? () => toggle(b.id) : undefined}
                  >
                    {issue === "noGroup" && (
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggle(b.id)} onClick={(e) => e.stopPropagation()} aria-label={`${b.name} নির্বাচন`} className="w-4 h-4 accent-[#22242A]" />
                      </td>
                    )}
                    <td className="px-4 py-2.5 font-mono text-xs text-[#6B6B70]">{b.code}</td>
                    <td className="px-4 py-2.5 font-bold text-[#22242A]">
                      <a href={`/books/${b.id}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline">{b.name}</a>
                    </td>
                    <td className={`px-4 py-2.5 ${isPlaceholder(b.author) ? "text-amber-700 italic" : "text-[#22242A]"}`}>{b.author || "—"}</td>
                    <td className={`px-4 py-2.5 hidden md:table-cell ${isPlaceholder(b.publisher) ? "text-amber-700 italic" : "text-[#6B6B70]"}`}>{b.publisher || "—"}</td>
                    <td className="px-4 py-2.5 hidden lg:table-cell text-[#6B6B70]">{b.group || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > rowLimit && (
              <div className="p-4 text-center">
                <button onClick={() => setRowLimit((n) => n + ROWS_STEP)} className="rounded-xl border border-[#22242A] px-5 py-2 text-sm font-bold">
                  আরও দেখুন ({toBn(rows.length - rowLimit)}টি বাকি)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
