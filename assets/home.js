import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  parsePlayRows,
  isChildPlay,
  groupByPlay,
  trLower,
} from "@/lib/theater";
import type { PlayRow } from "@/lib/theater";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ExcelDialog } from "@/components/excel-dialog";
import {
  Search,
  X,
  Baby,
  ChevronLeft,
  Download,
  Users,
  Rows3,
} from "lucide-react";

type SheetData = { headers: string[]; rows: any[][] };

const KAT_COLORS: Record<string, string> = {
  Oyuncu: "#e11d48",
  Figüran: "#f59e0b",
  Tasarım: "#7c3aed",
  Işık: "#0891b2",
  Ses: "#0891b2",
  Müzisyen: "#059669",
  Yönetim: "#d97706",
  Kostüm: "#7c3aed",
  Dekor: "#7c3aed",
  Reji: "#d97706",
};

function getKatColor(name: string): string {
  if (!name) return "#6b7280";
  for (const key of Object.keys(KAT_COLORS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return KAT_COLORS[key];
  }
  return "#6b7280";
}

function PlayDetail({
  playName,
  rows,
  onBack,
  onExcel,
}: {
  playName: string;
  rows: PlayRow[];
  onBack: () => void;
  onExcel: () => void;
}) {
  const [, navigate] = useLocation();

  const byCategory = useMemo(() => {
    const map = new Map<string, PlayRow[]>();
    rows.forEach((r) => {
      const key = r.kategori || "Diğer";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    });
    return map;
  }, [rows]);

  const categories = useMemo(() => Array.from(byCategory.keys()), [byCategory]);

  const personelCount = useMemo(() => {
    const names = new Set<string>();
    rows.forEach((r) =>
      r.kisi.split(",").forEach((k) => {
        if (k.trim()) names.add(k.trim());
      }),
    );
    return names.size;
  }, [rows]);

  const child = isChildPlay(playName);

  return (
    <div className="flex flex-col h-full">
      <div
        className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border"
        style={{ background: "hsl(var(--card))" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-black text-[20px] text-foreground tracking-tight leading-tight">
                {playName}
              </h2>
              {child && (
                <span className="text-[10px] font-semibold text-chart-4 bg-chart-4/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Baby className="w-2.5 h-2.5" />
                  Ç.O
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">
                {personelCount}
              </span>{" "}
              kişi &nbsp;·&nbsp;{" "}
              <span className="font-semibold text-foreground">
                {rows.length}
              </span>{" "}
              kayıt
            </p>
          </div>
        </div>
        <button
          onClick={onExcel}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-3 h-3" />
          Excel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {categories.map((cat) => {
          const catRows = byCategory.get(cat)!;
          const color = getKatColor(cat);
          return (
            <div
              key={cat}
              className="rounded-xl overflow-hidden"
              style={{
                background: "hsl(var(--card))",
                border: `1px solid ${color}30`,
                boxShadow: `0 1px 8px ${color}10`,
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{
                  background: `${color}12`,
                  borderBottom: `2px solid ${color}30`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span
                    className="text-[13px] font-black tracking-wide"
                    style={{ color }}
                  >
                    {cat.toUpperCase()}
                  </span>
                </div>
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${color}20`, color }}
                >
                  {catRows.length} kişi
                </span>
              </div>
              <div
                className="divide-y divide-border/40"
                style={{ background: "hsl(var(--card))" }}
              >
                {catRows.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors group"
                  >
                    <span
                      className="text-[14px] font-bold text-foreground cursor-pointer group-hover:text-primary transition-colors"
                      onClick={() =>
                        navigate(`/oyunlar?kisi=${encodeURIComponent(r.kisi)}`)
                      }
                      title="Kişi profiline git"
                    >
                      {r.kisi}
                    </span>
                    {r.gorev && (
                      <span className="text-[11px] text-muted-foreground shrink-0 italic">
                        {r.gorev}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "yetiskin" | "cocuk">(
    "all",
  );
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [excelOpen, setExcelOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const { data, isLoading } = useQuery<SheetData>({
    queryKey: ["/api/sheets", "BÜTÜN OYUNLAR"],
    refetchOnMount: "always",
  });

  const rows = useMemo(
    () => (data ? parsePlayRows(data.headers, data.rows) : []),
    [data],
  );
  const plays = useMemo(() => groupByPlay(rows), [rows]);

  const totalPersonelCount = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) =>
      r.kisi.split(",").forEach((k) => {
        if (k.trim()) s.add(k.trim());
      }),
    );
    return s.size;
  }, [rows]);

  const filtered = useMemo(() => {
    let result = plays;
    if (typeFilter === "yetiskin")
      result = result.filter((p) => !isChildPlay(p.name));
    if (typeFilter === "cocuk")
      result = result.filter((p) => isChildPlay(p.name));
    if (search.trim()) {
      const lower = trLower(search.trim());
      result = result.filter(
        (p) =>
          trLower(p.name).includes(lower) ||
          rows
            .filter((r) => r.oyun === p.name)
            .some(
              (r) =>
                trLower(r.kisi).includes(lower) ||
                trLower(r.gorev).includes(lower) ||
                trLower(r.kategori).includes(lower),
            ),
      );
    }
    return result;
  }, [plays, search, typeFilter, rows]);

  const selectedRows = useMemo(
    () => (selected ? rows.filter((r) => r.oyun === selected) : []),
    [rows, selected],
  );

  const handleSelect = useCallback((name: string) => {
    setSelected(name);
    setMobileView("detail");
  }, []);
  const handleBack = useCallback(() => {
    setMobileView("list");
    setSelected(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full">
        <div
          className="w-72 shrink-0 border-r p-3 space-y-2"
          style={{ minWidth: "300px" }}
        >
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-7 w-full rounded-lg" />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-12 w-80 rounded-lg" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT */}
        <div
          className={`${mobileView === "detail" ? "hidden" : "flex"} md:flex flex-col w-full md:w-72 shrink-0 border-r border-border`}
          style={{
            background: "hsl(var(--card))",
            minWidth: "300px",
            width: "300px",
          }}
        >
          <div className="px-3 py-2 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                data-testid="input-search-home"
                placeholder="Oyun, kişi, görev ara…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-7 h-8 text-[12px]"
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch("")}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex gap-1 mt-2">
              {(["all", "yetiskin", "cocuk"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className="flex-1 py-1.5 text-[11px] font-semibold rounded-md transition-all"
                  style={
                    typeFilter === f
                      ? {
                          background: "hsl(var(--sidebar))",
                          color: "hsl(var(--sidebar-primary))",
                          fontWeight: "700",
                        }
                      : {
                          background: "transparent",
                          color: "hsl(var(--foreground))",
                          border: "1px solid hsl(var(--border))",
                        }
                  }
                >
                  {f === "all" ? (
                    "Tümü"
                  ) : f === "yetiskin" ? (
                    "Yetişkin"
                  ) : (
                    <span className="flex items-center justify-center gap-0.5">
                      <Baby className="w-2.5 h-2.5" />
                      Çocuk
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 px-0.5">
              {filtered.length} oyun
              {search && (
                <span className="text-primary font-medium"> · "{search}"</span>
              )}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((play) => {
              const isActive = selected === play.name;
              const child = isChildPlay(play.name);
              return (
                <button
                  key={play.name}
                  data-testid={`play-item-${play.name}`}
                  onClick={() => handleSelect(play.name)}
                  className="w-full text-left px-3 py-3 border-b border-border/50 transition-colors flex items-center gap-2.5"
                  style={
                    isActive
                      ? {
                          background: "hsl(var(--sidebar))",
                          color: "hsl(var(--sidebar-foreground))",
                        }
                      : {
                          background: "transparent",
                          color: "hsl(var(--foreground))",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "hsl(var(--muted))";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black"
                    style={
                      isActive
                        ? {
                            background: "hsl(var(--sidebar-primary) / 0.2)",
                            color: "hsl(var(--sidebar-primary))",
                          }
                        : {
                            background: "hsl(var(--muted))",
                            color: "hsl(var(--muted-foreground))",
                          }
                    }
                  >
                    {(play.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[13px] font-bold leading-snug truncate"
                        style={
                          isActive
                            ? { color: "hsl(var(--sidebar-foreground))" }
                            : {}
                        }
                      >
                        {play.name}
                      </span>
                      {child && (
                        <Baby
                          className="w-3 h-3 shrink-0"
                          style={
                            isActive
                              ? { color: "hsl(var(--sidebar-primary))" }
                              : { color: "hsl(var(--chart-4))" }
                          }
                        />
                      )}
                    </div>
                    <p
                      className="text-[11px] mt-0.5 flex items-center gap-2"
                      style={
                        isActive
                          ? { color: "hsl(var(--sidebar-foreground) / 0.65)" }
                          : { color: "hsl(var(--muted-foreground))" }
                      }
                    >
                      <span className="flex items-center gap-0.5">
                        <Users className="w-2.5 h-2.5" />
                        {play.personelCount} kişi
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Rows3 className="w-2.5 h-2.5" />
                        {play.rowCount} satır
                      </span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div
          className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0`}
          style={{ background: "hsl(var(--background))" }}
        >
          {selected ? (
            <PlayDetail
              playName={selected}
              rows={selectedRows}
              onBack={handleBack}
              onExcel={() => setExcelOpen(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Nasıl kullanılır?
              </p>
              <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                {[
                  {
                    n: "1",
                    title: "Oyun seçin",
                    desc: "Sol listeden bir oyuna tıklayın. Tüm kadro sağ panelde kategorilere göre görünür.",
                  },
                  {
                    n: "2",
                    title: "Kişiye tıklayın",
                    desc: "Kadrodaki bir isme tıklayarak o kişinin tüm oyun ve görev geçmişine geçin.",
                  },
                  {
                    n: "3",
                    title: "Raporlama & Admin",
                    desc: "Excel raporu için Sorgulama sayfasını, veri düzenlemek için sağ üstteki kalkan ikonunu kullanın.",
                  },
                ].map((item) => (
                  <div
                    key={item.n}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                      style={{
                        background: "hsl(var(--sidebar-primary) / 0.15)",
                        color: "hsl(var(--sidebar-primary))",
                      }}
                    >
                      {item.n}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-foreground">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col items-center gap-2 mt-1">
                <button
                  onClick={() => setShowStats((v) => !v)}
                  className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showStats ? "▲ Gizle" : "▼ İstatistikler"}
                </button>
                {showStats && (
                  <div className="flex gap-2">
                    {[
                      { val: plays.length, label: "oyun" },
                      { val: totalPersonelCount, label: "kişi" },
                      { val: rows.length, label: "kayıt" },
                    ].map((s) => (
                      <span
                        key={s.label}
                        className="text-[11px] px-2.5 py-1 rounded-lg"
                        style={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                        }}
                      >
                        <strong>{s.val}</strong> {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <ExcelDialog
          open={excelOpen}
          onClose={() => setExcelOpen(false)}
          playName={selected}
          rows={selectedRows}
        />
      )}
    </div>
  );
}
