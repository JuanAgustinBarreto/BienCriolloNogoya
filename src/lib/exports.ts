import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { fmtCurrency, fmtDateTime } from "./format";

type Venta = { vendedor: string; variedad: string; cantidad: number; precio_unitario: number; total: number; negocio: string; created_at: string };
type Gasto = { responsable: string; monto: number; donde_compro: string; descripcion: string; created_at: string };

export function exportVentasPDF(ventas: Venta[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Pizzas Bien Criollo - Ventas", 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [["Fecha", "Vendedor", "Variedad", "Cant.", "Negocio", "Total"]],
    body: ventas.map(v => [fmtDateTime(v.created_at), v.vendedor, v.variedad, v.cantidad, v.negocio, fmtCurrency(v.total)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [255, 140, 0] },
  });
  doc.save(`ventas-${Date.now()}.pdf`);
}

export function exportResumenPDF(
  ventas: Venta[],
  gastos: Gasto[],
  opts: { titulo: string; rango?: string } = { titulo: "Resumen General" }
) {
  const doc = new jsPDF();
  const totalVentas = ventas.reduce((a, v) => a + Number(v.total), 0);
  const totalGastos = gastos.reduce((a, g) => a + Number(g.monto), 0);
  const ganancia = totalVentas - totalGastos;
  const pizzas = ventas.reduce((a, v) => a + v.cantidad, 0);

  doc.setFontSize(16);
  doc.text(`Pizzas Bien Criollo - ${opts.titulo}`, 14, 16);
  doc.setFontSize(10);
  if (opts.rango) doc.text(`Rango: ${opts.rango}`, 14, 23);
  doc.text(`Generado: ${fmtDateTime(new Date())}`, 14, opts.rango ? 29 : 23);

  autoTable(doc, {
    startY: opts.rango ? 35 : 29,
    head: [["Concepto", "Valor"]],
    body: [
      ["Total ventas", fmtCurrency(totalVentas)],
      ["Total gastos", fmtCurrency(totalGastos)],
      ["Ganancia neta", fmtCurrency(ganancia)],
      ["Pizzas vendidas", String(pizzas)],
      ["Cantidad de ventas", String(ventas.length)],
      ["Cantidad de gastos", String(gastos.length)],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 140, 0] },
  });

  if (ventas.length) {
    autoTable(doc, {
      head: [["Fecha", "Vendedor", "Variedad", "Cant.", "Negocio", "Total"]],
      body: ventas.map(v => [fmtDateTime(v.created_at), v.vendedor, v.variedad, v.cantidad, v.negocio, fmtCurrency(v.total)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 140, 0] },
      didDrawPage: (d) => { doc.setFontSize(12); doc.text("Detalle de ventas", 14, d.settings.startY ? 10 : 10); },
    });
  }

  if (gastos.length) {
    autoTable(doc, {
      head: [["Fecha", "Responsable", "Donde", "Descripción", "Monto"]],
      body: gastos.map(g => [fmtDateTime(g.created_at), g.responsable, g.donde_compro, g.descripcion, fmtCurrency(g.monto)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 0, 0] },
    });
  }

  const slug = opts.titulo.toLowerCase().replace(/\s+/g, "-");
  doc.save(`resumen-${slug}-${Date.now()}.pdf`);
}

export function exportGastosPDF(gastos: Gasto[]) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Pizzas Bien Criollo - Gastos", 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [["Fecha", "Responsable", "Donde", "Descripción", "Monto"]],
    body: gastos.map(g => [fmtDateTime(g.created_at), g.responsable, g.donde_compro, g.descripcion, fmtCurrency(g.monto)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [139, 0, 0] },
  });
  doc.save(`gastos-${Date.now()}.pdf`);
}

export function exportExcel(ventas: Venta[], gastos: Gasto[]) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ventas), "Ventas");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gastos), "Gastos");
  XLSX.writeFile(wb, `bien-criollo-${Date.now()}.xlsx`);
}

export function backupJSON(ventas: Venta[], gastos: Gasto[]) {
  const blob = new Blob([JSON.stringify({ ventas, gastos, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
  saveAs(blob, `backup-bien-criollo-${Date.now()}.json`);
}
