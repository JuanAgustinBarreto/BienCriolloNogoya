import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DollarSign, Receipt, TrendingUp, Pizza, Download, FileSpreadsheet, FileText, Database } from "lucide-react";
import { useVentas } from "@/hooks/useVentas";
import { useGastos } from "@/hooks/useGastos";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { fmtCurrency } from "@/lib/format";
import { backupJSON, exportExcel, exportVentasPDF } from "@/lib/exports";

export const Route = createFileRoute("/resumen")({ component: ResumenPage });

type Range = "hoy" | "semana" | "mes" | "todo";

function ResumenPage() {
  const { ventas } = useVentas();
  const { gastos } = useGastos();
  const [range, setRange] = useState<Range>("mes");

  const { vFiltradas, gFiltrados } = useMemo(() => {
    const now = new Date();
    let from: Date | null = new Date(now);
    if (range === "hoy") from.setHours(0, 0, 0, 0);
    else if (range === "semana") { from.setDate(now.getDate() - 7); from.setHours(0, 0, 0, 0); }
    else if (range === "mes") { from.setDate(1); from.setHours(0, 0, 0, 0); }
    else from = null;
    const filt = (d: string) => !from || new Date(d) >= from;
    return { vFiltradas: ventas.filter(v => filt(v.created_at)), gFiltrados: gastos.filter(g => filt(g.created_at)) };
  }, [ventas, gastos, range]);

  const totalVentas = vFiltradas.reduce((a, v) => a + Number(v.total), 0);
  const totalGastos = gFiltrados.reduce((a, g) => a + Number(g.monto), 0);
  const ganancia = totalVentas - totalGastos;
  const pizzas = vFiltradas.reduce((a, v) => a + v.cantidad, 0);

  const porVendedor = (name: string) => vFiltradas.filter(v => v.vendedor === name);
  const ventasDiego = porVendedor("Diego");
  const ventasAriel = porVendedor("Ariel");
  const totalDiego = ventasDiego.reduce((a, v) => a + Number(v.total), 0);
  const totalAriel = ventasAriel.reduce((a, v) => a + Number(v.total), 0);

  const ranking = useMemo(() => {
    const map: Record<string, number> = {};
    vFiltradas.forEach(v => { if (v.negocio) map[v.negocio] = (map[v.negocio] || 0) + Number(v.total); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [vFiltradas]);

  return (
    <>
      <PageHeader
        title="Resumen"
        subtitle="Análisis y exportaciones"
        actions={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {(["hoy", "semana", "mes", "todo"] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 text-xs rounded-md capitalize ${range === r ? "gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {r}
              </button>
            ))}
          </div>
        }
      />
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="Total ventas" value={fmtCurrency(totalVentas)} icon={DollarSign} accent="primary" />
          <KpiCard label="Total gastos" value={fmtCurrency(totalGastos)} icon={Receipt} accent="secondary" />
          <KpiCard label="Ganancia neta" value={fmtCurrency(ganancia)} icon={TrendingUp} accent={ganancia >= 0 ? "success" : "secondary"} />
          <KpiCard label="Pizzas vendidas" value={pizzas} icon={Pizza} accent="warning" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-4">Diego</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Ventas</span><span className="font-semibold">{ventasDiego.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pizzas</span><span className="font-semibold">{ventasDiego.reduce((a, v) => a + v.cantidad, 0)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Total facturado</span><span className="font-bold text-primary">{fmtCurrency(totalDiego)}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-semibold mb-4">Ariel</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Ventas</span><span className="font-semibold">{ventasAriel.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pizzas</span><span className="font-semibold">{ventasAriel.reduce((a, v) => a + v.cantidad, 0)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Total facturado</span><span className="font-bold text-primary">{fmtCurrency(totalAriel)}</span></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-4">Ranking de negocios</h3>
          {ranking.length === 0 ? <p className="text-sm text-muted-foreground">Sin datos en este rango.</p> : (
            <ul className="space-y-2">
              {ranking.map(([name, total], i) => (
                <li key={name} className="flex items-center justify-between rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-center gap-3">
                    <span className={`size-8 grid place-items-center rounded-lg font-bold text-sm ${i === 0 ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <span className="text-primary font-semibold">{fmtCurrency(total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-semibold mb-4">Exportaciones</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <button onClick={() => exportVentasPDF(vFiltradas)} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
              <FileText className="size-6 text-primary" />
              <div><div className="font-medium text-sm">Exportar PDF</div><div className="text-xs text-muted-foreground">Ventas filtradas</div></div>
            </button>
            <button onClick={() => exportExcel(vFiltradas, gFiltrados)} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
              <FileSpreadsheet className="size-6 text-success" />
              <div><div className="font-medium text-sm">Exportar Excel</div><div className="text-xs text-muted-foreground">Ventas + gastos</div></div>
            </button>
            <button onClick={() => backupJSON(ventas, gastos)} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left">
              <Database className="size-6 text-warning" />
              <div><div className="font-medium text-sm">Backup JSON</div><div className="text-xs text-muted-foreground">Todos los datos</div></div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
