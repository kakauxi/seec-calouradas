import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Guest } from '@/types/guest';
import { format } from 'date-fns';

export const exportGuestListToPdf = (guests: Guest[], type: 'paying' | 'courtesy' | 'all') => {
  const doc = new jsPDF();
  const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');
  
  const title = type === 'paying' 
    ? 'Lista de Convidados - Pagantes' 
    : type === 'courtesy' 
      ? 'Lista de Convidados - Cortesias' 
      : 'Lista de Convidados - Completa';

  doc.setFontSize(18);
  doc.text('No Sigilo (SEEC/SPOTTED)', 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(title, 14, 30);
  doc.text(`Gerado em: ${dateStr}`, 14, 38);

  const tableData = guests.map((g, index) => [
    index + 1,
    g.name,
    g.phone || 'N/A',
    g.isCourtesy ? 'Cortesia' : 'Pagante',
    g.isPresent ? 'Sim' : 'Não'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['#', 'Nome', 'Telefone', 'Tipo', 'Presente']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0] },
    styles: { fontSize: 10 },
  });

  const fileName = `lista_convidados_${type}_${format(new Date(), 'dd_MM_yyyy')}.pdf`;
  doc.save(fileName);
};