// Client-side export helpers for the Vehicle Detail maintenance table.
// Both formats render the same rows as the on-screen table. The Spending
// Trends chart is a separate view and is never included in an export.
//
// jsPDF is loaded lazily (dynamic import) so the PDF bundle stays out of
// the initial page load and only downloads when the user picks "Export as PDF".

export type ExportCell = string;
export type ExportRow = ExportCell[];

// Replace characters that are not valid in file names (Windows, macOS, Unix)
// and collapse the resulting spaces.
export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim();
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

// Quote every CSV field and double any embedded quotes (RFC 4180).
function csvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Download the rows as a UTF-8 CSV file (BOM so Excel reads it correctly). */
export function downloadCsv(
  fileName: string,
  headers: ExportRow,
  rows: ExportRow[]
): void {
  const lines = [headers, ...rows].map((row) => row.map(csvField).join(","));
  const csv = "\uFEFF" + lines.join("\r\n");
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), fileName);
}

/** Download the rows as a PDF table (A4 landscape, jsPDF + autotable). */
export async function downloadPdf(
  fileName: string,
  title: string,
  headers: ExportRow,
  rows: ExportRow[]
): Promise<void> {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(title, 40, 36);

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Exported ${new Date().toLocaleDateString()}`, 40, 52);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 66,
    margin: { left: 40, right: 40, top: 20, bottom: 20 },
    showHead: "everyPage",
    styles: { font: "helvetica", fontSize: 9, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [47, 127, 225], textColor: 255 },
  });

  doc.save(fileName);
}
