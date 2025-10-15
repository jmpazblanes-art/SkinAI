import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { HistoryEntry } from '../types';

// Fix: Replaced the problematic module augmentation with a local type and type assertion.
// The original `declare module 'jspdf'` was causing a module resolution error. Using a
// type intersection is a more robust way to add the `autoTable` method to the jsPDF instance type.
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => jsPDF;
};

export const exportToCSV = (data: HistoryEntry[], filename: string = 'historial-analisis-piel.csv') => {
  if (data.length === 0) return;

  const headers = ['Fecha', 'Tipo de Piel', 'Puntuación General', 'Problemas Detectados'];
  const rows = data.map(entry => [
    new Date(entry.date).toLocaleString(),
    entry.analysis.skinType,
    entry.analysis.overallScore,
    entry.analysis.problems.map(p => `${p.issue} (${p.severity})`).join('; ')
  ]);

  let csvContent = "data:text/csv;charset=utf-t8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


export const exportToPDF = (data: HistoryEntry[], filename: string = 'historial-analisis-piel.pdf') => {
  if (data.length === 0) return;

  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // Fix: Property 'text' does not exist on type 'jsPDFWithAutoTable'. This is now fixed by using a type intersection.
  doc.text("Historial de Análisis de Piel", 14, 20);

  const tableColumn = ["Fecha", "Tipo de Piel", "Puntuación", "Problemas"];
  const tableRows: (string | number)[][] = [];

  data.forEach(entry => {
    const row = [
      new Date(entry.date).toLocaleDateString(),
      entry.analysis.skinType,
      entry.analysis.overallScore,
      entry.analysis.problems.map(p => p.issue).join(', ')
    ];
    tableRows.push(row);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
  });

  // Fix: Property 'save' does not exist on type 'jsPDFWithAutoTable'. This is now fixed by using a type intersection.
  doc.save(filename);
};