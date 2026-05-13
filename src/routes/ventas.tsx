import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Pencil, Pizza, Download, FileText } from "lucide-react";
import { useVentas } from "@/hooks/useVentas";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtCurrency, fmtDateTime, PIZZAS, VENDEDORES } from "@/lib/format";
import { exportVentasPDF } from "@/lib/exports";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/ventas")({ component: VentasPage });

function VentasPage() {
  const { isAdmin } = useAuth();
  const { ventas, loading, add, update, remove } = useVentas();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [vendedor, setVendedor] = useState<string>("Diego");
  const [variedad, setVariedad] = useState<string>("Muzza");
  const [cantidad, setCantidad] = useState<number>(1);
  const [negocio, setNegocio] = useState<string>("");
  const [q, setQ] = useState("");
  const [filterVendedor, setFilterVendedor] = useState<string>("");
  const [filterFecha, setFilterFecha] = useState<string>("");

  const total = (PIZZAS[variedad] || 0) * cantidad;

  const filtered = useMemo(() => {
    return ventas.filter(v => {
      if (filterVendedor && v.vendedor !== filterVendedor) return false;
      if (filterFecha) {
        const d = new Date(v.created_at).toISOString().slice(0, 10);
        if (d !== filterFecha) return false;
      }
      if (q) {
        const s = q.toLowerCase();
        if (!v.variedad.toLowerCase().includes(s) && !v.vendedor.toLowerCase().includes(s) && !(v.negocio || "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [ventas, q, filterVendedor, filterFecha]);

  const reset = () => { setEditId(null); setVendedor("Diego"); setVariedad("Muzza"); setCantidad(1); setNegocio(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cantidad < 1) return toast.error("Cantidad inválida");
    const payload = { vendedor, variedad, cantidad, precio_unitario: PIZZAS[variedad], total, negocio };
    const ok = editId ? await update(editId, payload) : await add(payload);
    if (ok) { setOpen(false); reset(); }
  };

  const startEdit = (v: typeof ventas[number]) => {
    setEditId(v.id); setVendedor(v.vendedor); setVariedad(v.variedad); setCantidad(v.cantidad); setNegocio(v.negocio || ""); setOpen(true);
  };

  const confirmDelete = (id: string) => {
    if (confirm("¿Eliminar esta venta?")) remove(id);
  };

  return (
    <>
      <PageHeader
        title="Ventas"
        subtitle={`${filtered.length} registros`}
        actions={
          <>
            <button onClick={() => exportVentasPDF(filtered)} className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary transition-colors">
              <FileText className="size-4" /> PDF
            </button>
            {isAdmin && (
              <button onClick={() => { reset(); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-glow">
                <Plus className="size-4" /> Nueva
              </button>
            )}
          </>
        }
      />
      <div className="p-4 md:p-8 space-y-4">
        <div className="grid md:grid-cols-4 gap-2">
          <div className="md:col-span-2 relative">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por vendedor, pizza, negocio…" className="w-full pl-10 pr-3 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm" />
          </div>
          <select value={filterVendedor} onChange={e => setFilterVendedor(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm">
            <option value="">Todos los vendedores</option>
            {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          <input type="date" value={filterFecha} onChange={e => setFilterFecha(e.target.value)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Pizza} title="Sin ventas" message="Registrá una nueva venta para empezar." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-background/40">
                  <tr><th className="px-4 py-3">Fecha</th><th>Vendedor</th><th>Pizza</th><th>Cant.</th><th>Negocio</th><th>Total</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(v => (
                    <motion.tr key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border/60 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(v.created_at)}</td>
                      <td><span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-medium">{v.vendedor}</span></td>
                      <td className="font-medium">{v.variedad}</td>
                      <td>{v.cantidad}</td>
                      <td className="text-muted-foreground">{v.negocio || "—"}</td>
                      <td className="font-semibold">{fmtCurrency(Number(v.total))}</td>
                      <td className="pr-3">
                        {isAdmin ? (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => startEdit(v)} className="p-1.5 rounded-md hover:bg-primary/15 text-muted-foreground hover:text-primary"><Pencil className="size-4" /></button>
                            <button onClick={() => confirmDelete(v.id)} className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
                          </div>
                        ) : null}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {open && isAdmin && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <motion.form
            initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()} onSubmit={submit}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-glow space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold">{editId ? "Editar venta" : "Nueva venta"}</h3>
              <p className="text-xs text-muted-foreground">Completá los datos de la venta</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Vendedor</span>
                <select value={vendedor} onChange={e => setVendedor(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border">
                  {VENDEDORES.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Variedad</span>
                <select value={variedad} onChange={e => setVariedad(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border">
                  {Object.keys(PIZZAS).map(p => <option key={p}>{p}</option>)}
                </select>
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Cantidad</span>
                <input type="number" min={1} value={cantidad} onChange={e => setCantidad(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Precio unitario</span>
                <input value={fmtCurrency(PIZZAS[variedad])} disabled className="w-full px-3 py-2 rounded-lg bg-background border border-border text-muted-foreground" />
              </label>
              <label className="text-sm space-y-1 col-span-2">
                <span className="text-muted-foreground">Negocio</span>
                <input value={negocio} onChange={e => setNegocio(e.target.value)} placeholder="Ej: Kiosco San Martín" className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
              </label>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{fmtCurrency(total)}</span>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium">{editId ? "Guardar" : "Registrar"}</button>
            </div>
          </motion.form>
        </div>
      )}
    </>
  );
}
