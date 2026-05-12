import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Receipt, Pizza, Trophy, Users, Store, Sparkles } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useVentas } from "@/hooks/useVentas";
import { useGastos } from "@/hooks/useGastos";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { EmptyState } from "@/components/EmptyState";
import { fmtCurrency, fmtDateTime } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Dashboard });

const COLORS = ["#FF8C00", "#8B0000", "#FFB347", "#D2691E", "#A0522D", "#FFA500"];

function Dashboard() {
  const { ventas, loading } = useVentas();
  const { gastos } = useGastos();

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);

    const ventasHoy = ventas.filter(v => new Date(v.created_at) >= today);
    const ventasMes = ventas.filter(v => new Date(v.created_at) >= month);
    const totalHoy = ventasHoy.reduce((a, v) => a + Number(v.total), 0);
    const totalMes = ventasMes.reduce((a, v) => a + Number(v.total), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto), 0);
    const ganancia = totalMes - totalGastos;
    const pizzasVendidas = ventas.reduce((a, v) => a + v.cantidad, 0);

    const porVariedad: Record<string, number> = {};
    const porVendedor: Record<string, number> = {};
    const porNegocio: Record<string, number> = {};
    ventas.forEach(v => {
      porVariedad[v.variedad] = (porVariedad[v.variedad] || 0) + v.cantidad;
      porVendedor[v.vendedor] = (porVendedor[v.vendedor] || 0) + Number(v.total);
      if (v.negocio) porNegocio[v.negocio] = (porNegocio[v.negocio] || 0) + Number(v.total);
    });

    const topPizza = Object.entries(porVariedad).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const topVendedor = Object.entries(porVendedor).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
    const topNegocio = Object.entries(porNegocio).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    // últimos 7 días
    const days: { dia: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const total = ventas.filter(v => { const t = new Date(v.created_at); return t >= d && t < next; })
        .reduce((a, v) => a + Number(v.total), 0);
      days.push({ dia: d.toLocaleDateString("es-AR", { weekday: "short", day: "2-digit" }), total });
    }

    const variedadData = Object.entries(porVariedad).map(([name, value]) => ({ name, value }));
    const vendedorData = Object.entries(porVendedor).map(([name, total]) => ({ name, total }));
    const rankingNegocios = Object.entries(porNegocio).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalHoy, totalMes, totalGastos, ganancia, pizzasVendidas, topPizza, topVendedor, topNegocio, days, variedadData, vendedorData, rankingNegocios };
  }, [ventas, gastos]);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Pizzas Bien Criollo · Resumen en vivo" />
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="Ventas hoy" value={fmtCurrency(stats.totalHoy)} icon={DollarSign} accent="primary" />
          <KpiCard label="Ventas del mes" value={fmtCurrency(stats.totalMes)} icon={TrendingUp} accent="success" />
          <KpiCard label="Gastos totales" value={fmtCurrency(stats.totalGastos)} icon={Receipt} accent="secondary" />
          <KpiCard label="Ganancia neta" value={fmtCurrency(stats.ganancia)} icon={Sparkles} accent={stats.ganancia >= 0 ? "success" : "secondary"} hint="mes - gastos" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <KpiCard label="Pizzas vendidas" value={stats.pizzasVendidas} icon={Pizza} accent="warning" />
          <KpiCard label="Pizza más vendida" value={stats.topPizza} icon={Trophy} accent="primary" />
          <KpiCard label="Mejor vendedor" value={stats.topVendedor} icon={Users} accent="success" />
          <KpiCard label="Mejor negocio" value={stats.topNegocio} icon={Store} accent="secondary" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-4 md:p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Ventas últimos 7 días</h3>
              <span className="text-xs text-muted-foreground">ARS</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.days}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis dataKey="dia" stroke="#888" fontSize={11} />
                  <YAxis stroke="#888" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} formatter={(v: number) => fmtCurrency(v)} />
                  <Line type="monotone" dataKey="total" stroke="#FF8C00" strokeWidth={3} dot={{ fill: "#FF8C00", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-card">
            <h3 className="font-semibold mb-4">Pizzas más vendidas</h3>
            <div className="h-64">
              {stats.variedadData.length === 0 ? (
                <EmptyState icon={Pizza} title="Sin datos aún" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.variedadData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                      {stats.variedadData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-card">
            <h3 className="font-semibold mb-4">Ventas por vendedor</h3>
            <div className="h-56">
              {stats.vendedorData.length === 0 ? <EmptyState icon={Users} title="Sin datos" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.vendedorData}>
                    <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#888" fontSize={11} />
                    <YAxis stroke="#888" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }} formatter={(v: number) => fmtCurrency(v)} />
                    <Bar dataKey="total" fill="#FF8C00" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-card">
            <h3 className="font-semibold mb-4">Ranking negocios</h3>
            {stats.rankingNegocios.length === 0 ? <EmptyState icon={Store} title="Sin negocios cargados" /> : (
              <ul className="space-y-2">
                {stats.rankingNegocios.map(([name, total], i) => (
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
        </div>

        <div className="rounded-xl border border-border bg-card p-4 md:p-5 shadow-card">
          <h3 className="font-semibold mb-4">Últimas ventas</h3>
          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : ventas.length === 0 ? <EmptyState icon={Pizza} title="Aún no hay ventas" message="Registrá la primera desde el módulo Ventas." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground border-b border-border">
                  <tr><th className="py-2">Fecha</th><th>Vendedor</th><th>Pizza</th><th>Cant.</th><th>Negocio</th><th className="text-right">Total</th></tr>
                </thead>
                <tbody>
                  {ventas.slice(0, 6).map(v => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5">{fmtDateTime(v.created_at)}</td>
                      <td><span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-medium">{v.vendedor}</span></td>
                      <td>{v.variedad}</td>
                      <td>{v.cantidad}</td>
                      <td className="text-muted-foreground">{v.negocio || "—"}</td>
                      <td className="text-right font-semibold">{fmtCurrency(Number(v.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
