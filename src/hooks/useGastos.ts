import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Gasto = Tables<"gastos">;

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from("gastos").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Error cargando gastos");
    else setGastos(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("gastos-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "gastos" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const add = async (g: TablesInsert<"gastos">) => {
    const { error } = await supabase.from("gastos").insert(g);
    if (error) { toast.error("No se pudo guardar"); return false; }
    toast.success("Gasto registrado");
    return true;
  };

  const update = async (id: string, g: Partial<TablesInsert<"gastos">>) => {
    const { error } = await supabase.from("gastos").update(g).eq("id", id);
    if (error) { toast.error("Error al actualizar"); return false; }
    toast.success("Gasto actualizado");
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("gastos").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return false; }
    toast.success("Gasto eliminado");
    return true;
  };

  return { gastos, loading, add, update, remove, reload: load };
}
