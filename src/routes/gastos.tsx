import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Pencil, Receipt, FileText } from "lucide-react";
import { useGastos } from "@/hooks/useGastos";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { fmtCurrency, fmtDateTime, VENDEDORES } from "@/lib/format";
import { exportGastosPDF } from "@/lib/exports";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/gastos")({ component: GastosPage });

function GastosPage() {
  const { isAdmin } = useAuth();
  const { gastos, loading, add, update, remove } = useGastos();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [responsable, setResponsable] = useState<string>("Diego");
  const [monto, setMonto] = useState<number>(0);
  const [donde, setDonde] = useState("");
  const [desc, setDesc] = useState("");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q) return gastos;
    const s = q.toLowerCase();
    return gastos.filter(g => g.responsable.toLowerCase().includes(s) || g.donde_compro.toLowerCase().includes(s) || g.descripcion.toLowerCase().includes(s));
  }, [gastos, q]);

  const reset = () => { setEditId(null); setResponsable("Diego"); setMonto(0); setDonde(""); setDesc(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (monto <= 0) return toast.error("Monto inválido");
    const payload = { responsable, monto, donde_compro: donde, descripcion: desc };
    const ok = editId ? await update(editId, payload) : await add(payload);
    if (ok) { setOpen(false); reset(); }
  };

  const startEdit = (g: typeof gastos[number]) => {
    setEditId(g.id); setResponsable(g.responsable); setMonto(Number(g.monto)); setDonde(g.donde_compro || ""); setDesc(g.descripcion || ""); setOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Gastos"
        subtitle={`${filtered.length} registros · Total ${fmtCurrency(filtered.reduce((a, g) => a + Number(g.monto), 0))}`}
        actions={
          <>
            <button onClick={() => exportGastosPDF(filtered)} className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary transition-colors">
              <FileText className="size-4" /> PDF
            </button>
            {isAdmin && (
              <button onClick={() => { reset(); setOpen(true); }} className="inline-flex items-center gap-2 rounded-lg gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-glow">
                <Plus className="size-4" /> Nuevo
              </button>
            )}
          </>
        }
      />
      <div className="p-4 md:p-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar gastos…" className="w-full pl-10 pr-3 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none text-sm" />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-card">
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={Receipt} title="Sin gastos" message="Registrá un gasto para empezar." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground bg-background/40">
                  <tr><th className="px-4 py-3">Fecha</th><th>Responsable</th><th>Donde</th><th>Descripción</th><th>Monto</th><th></th></tr>
                </thead>
                <tbody>
                  {filtered.map(g => (
                    <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-border/60 hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">{fmtDateTime(g.created_at)}</td>
                      <td><span className="px-2 py-0.5 rounded-md bg-secondary/30 text-xs font-medium">{g.responsable}</span></td>
                      <td>{g.donde_compro || "—"}</td>
                      <td className="text-muted-foreground">{g.descripcion || "—"}</td>
                      <td className="font-semibold text-secondary-foreground">{fmtCurrency(Number(g.monto))}</td>
                      <td className="pr-3">
                        {isAdmin ? (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => startEdit(g)} className="p-1.5 rounded-md hover:bg-primary/15 text-muted-foreground hover:text-primary"><Pencil className="size-4" /></button>
                            <button onClick={() => confirm("¿Eliminar este gasto?") && remove(g.id)} className="p-1.5 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
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
            <h3 className="text-lg font-semibold">{editId ? "Editar gasto" : "Nuevo gasto"}</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Responsable</span>
                <select value={responsable} onChange={e => setResponsable(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-background border border-border">
                  {VENDEDORES.map(v => <option key={v}>{v}</option>)}
                </select>
              </label>
              <label className="text-sm space-y-1">
                <span className="text-muted-foreground">Monto</span>
                <input type="number" min={0} value={monto} onChange={e => setMonto(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
              </label>
              <label className="text-sm space-y-1 col-span-2">
                <span className="text-muted-foreground">Donde compró</span>
                <input value={donde} onChange={e => setDonde(e.target.value)} placeholder="Ej: Mayorista Norte" className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
              </label>
              <label className="text-sm space-y-1 col-span-2">
                <span className="text-muted-foreground">Descripción</span>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg bg-background border border-border resize-none" />
              </label>
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
