import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Venta = Tables<"ventas">;

export function useVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from("ventas").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Error cargando ventas");
    else setVentas(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("ventas-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "ventas" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const add = async (v: TablesInsert<"ventas">) => {
    const { error } = await supabase.from("ventas").insert(v);
    if (error) { toast.error("No se pudo guardar"); return false; }
    toast.success("Venta registrada");
    return true;
  };

  const update = async (id: string, v: Partial<TablesInsert<"ventas">>) => {
    const { error } = await supabase.from("ventas").update(v).eq("id", id);
    if (error) { toast.error("Error al actualizar"); return false; }
    toast.success("Venta actualizada");
    return true;
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("ventas").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return false; }
    toast.success("Venta eliminada");
    return true;
  };

  return { ventas, loading, add, update, remove, reload: load };
}
