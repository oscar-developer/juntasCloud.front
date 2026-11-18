import { jsPDF } from 'jspdf';
import autoTable, { type UserOptions } from 'jspdf-autotable';
import * as QRCode from 'qrcode';

const attendanceLabels = {
  ASISTIO: 'Asistió',
  TARDE: 'Tardanza',
  FALTO: 'Faltó',
  JUSTIFICADO: 'Justificado',
} as const;

export type ConstanciaPdfAttendanceRow = {
  fecha: string;
  evento: string;
  estado: keyof typeof attendanceLabels;
};

type ConstanciaPdfData = {
  organizacion: string;
  documentoOrganizacion: string;
  codigo: string;
  fechaEmision: string;
  persona: {
    nombre: string;
    dni: string;
    padron: string;
    fechaRegistro: string;
    tipo: string;
    estado: string;
  };
  verificationUrl: string;
  snapshotHash: string;
  faenas: readonly ConstanciaPdfAttendanceRow[];
  asambleas: readonly ConstanciaPdfAttendanceRow[];
};

type AttendanceSection = { titulo: string; rows: readonly ConstanciaPdfAttendanceRow[] };
type Color = [number, number, number];

const margin = 17;
const annexTop = 43;
const bottom = 20;
const green: Color = [22, 85, 58];
const paleGreen: Color = [235, 244, 238];
const ink: Color = [20, 34, 30];
const muted: Color = [73, 88, 83];
const rule: Color = [198, 212, 205];
const paper: Color = [247, 250, 248];

function textStyle(pdf: jsPDF, size: number, bold = false, color = ink) {
  pdf.setFont('helvetica', bold ? 'bold' : 'normal');
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
}

function wrap(pdf: jsPDF, text: string, width: number): string[] {
  return pdf.splitTextToSize(text, width);
}

function lineStep(size: number) {
  return (size * 25.4 * 1.2) / 72;
}

function drawTable(pdf: jsPDF, options: UserOptions & { startY: number }) {
  let endY = options.startY;
  autoTable(pdf, {
    theme: 'plain',
    margin: { top: annexTop, right: margin, bottom, left: margin },
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 2, textColor: ink, overflow: 'linebreak' },
    headStyles: { fillColor: paleGreen, textColor: green, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: paper },
    ...options,
    didDrawPage: ({ cursor }) => {
      if (cursor) endY = cursor.y;
    },
  });
  return endY;
}

function drawRegistration(pdf: jsPDF, data: ConstanciaPdfData, width: number) {
  const right = margin + width;
  pdf.setFillColor(...green);
  pdf.rect(0, 0, pdf.internal.pageSize.getWidth(), 4, 'F');

  let organizationSize = 17;
  textStyle(pdf, organizationSize, true, green);
  let organization = wrap(pdf, data.organizacion, width);
  if (organization.length > 2) {
    organizationSize = 13;
    textStyle(pdf, organizationSize, true, green);
    organization = wrap(pdf, data.organizacion, width);
  }
  pdf.text(organization, margin, 17, { lineHeightFactor: 1.2 });
  let y = 17 + organization.length * lineStep(organizationSize);
  textStyle(pdf, 9, false, muted);
  pdf.text(data.documentoOrganizacion || 'Organización comunal', margin, y);

  y += 7;
  pdf.setDrawColor(...rule);
  pdf.line(margin, y, right, y);
  y += 10;
  textStyle(pdf, 15, true);
  pdf.text('CONSTANCIA DE REGISTRO Y CONDICIÓN', margin, y);
  y += 8;
  textStyle(pdf, 9, false, muted);
  pdf.text(`Código: ${data.codigo}`, margin, y);
  pdf.text(`Fecha de emisión: ${data.fechaEmision}`, right, y, { align: 'right' });

  y += 11;
  textStyle(pdf, 10);
  const statement = wrap(
    pdf,
    'Se deja constancia de que la persona identificada a continuación figura en el registro institucional con el tipo de participante y el estado indicados a la fecha de emisión.',
    width,
  );
  pdf.text(statement, margin, y, { lineHeightFactor: 1.2 });
  y += statement.length * lineStep(10) + 3;

  const { persona } = data;
  const padding = 5;
  const inner = width - padding * 2;
  const fieldWidth = inner / 3;
  const x = margin + padding;
  let nameSize = 12;
  textStyle(pdf, nameSize, true);
  let name = wrap(pdf, persona.nombre, inner);
  if (name.length > 3) {
    nameSize = 10;
    textStyle(pdf, nameSize, true);
    name = wrap(pdf, persona.nombre, inner);
  }
  const fieldsY = y + 18 + name.length * lineStep(nameSize);
  const panelBottom = fieldsY + 23;
  pdf.setFillColor(...paper);
  pdf.setDrawColor(...rule);
  pdf.roundedRect(margin, y, width, panelBottom - y, 2, 2, 'FD');

  textStyle(pdf, 9, true, green);
  pdf.text('Datos de registro', x, y + 7);
  textStyle(pdf, nameSize, true);
  pdf.text(name, x, y + 15, { lineHeightFactor: 1.2 });
  const fields = [
    ['DNI', persona.dni],
    ['Padrón', persona.padron],
    ['Fecha de registro', persona.fechaRegistro],
    ['Tipo de participante', persona.tipo],
    ['Estado', persona.estado],
  ];
  fields.forEach(([label, value], index) => {
    const fieldX = x + (index % 3) * fieldWidth;
    const fieldY = fieldsY + Math.floor(index / 3) * 11;
    textStyle(pdf, 8, false, muted);
    pdf.text(label, fieldX, fieldY);
    textStyle(pdf, 9, true);
    pdf.text(value, fieldX, fieldY + 4.5);
  });

  return panelBottom;
}

function drawSummary(pdf: jsPDF, sections: readonly AttendanceSection[], y: number) {
  textStyle(pdf, 11, true, green);
  pdf.text('Resumen de asistencia', margin, y);
  textStyle(pdf, 8.5, false, muted);
  pdf.text('Historial informativo de faenas y asambleas', margin, y + 5);

  const endY = drawTable(pdf, {
    startY: y + 8,
    head: [['Actividad', ...Object.values(attendanceLabels)]],
    body: sections.map(({ titulo, rows }) => {
      const counts = { ASISTIO: 0, TARDE: 0, FALTO: 0, JUSTIFICADO: 0 };
      for (const row of rows) counts[row.estado] += 1;
      return [titulo, counts.ASISTIO, counts.TARDE, counts.FALTO, counts.JUSTIFICADO];
    }),
    columnStyles: {
      1: { halign: 'right', cellWidth: 26 },
      2: { halign: 'right', cellWidth: 26 },
      3: { halign: 'right', cellWidth: 26 },
      4: { halign: 'right', cellWidth: 28 },
    },
    didParseCell: ({ section, column, cell }) => {
      if (section === 'head' && column.index > 0) cell.styles.halign = 'right';
    },
  });

  if (sections.every(({ rows }) => rows.length === 0)) {
    textStyle(pdf, 8.5, false, muted);
    pdf.text('Sin registros de asistencia para mostrar.', margin, endY + 5);
    return endY + 5;
  }
  return endY;
}

function drawVerification(pdf: jsPDF, data: ConstanciaPdfData, qr: string, width: number, y: number) {
  const qrSize = 32;
  const qrX = margin + width - qrSize - 5;
  const x = margin + 5;
  const textWidth = qrX - x - 5;
  textStyle(pdf, 8, false, green);
  const url = wrap(pdf, data.verificationUrl, textWidth);
  const linkY = y + 23;
  const hashY = linkY + url.length * lineStep(8) + 2;
  textStyle(pdf, 7.5, false, muted);
  const hash = wrap(pdf, `Huella del registro: ${data.snapshotHash}`, textWidth);
  const height = Math.max(qrSize + 10, hashY - y + hash.length * lineStep(7.5) + 3);

  pdf.setDrawColor(...rule);
  pdf.roundedRect(margin, y, width, height, 2, 2, 'S');
  textStyle(pdf, 10, true, green);
  pdf.text('Verificación pública', x, y + 8);
  textStyle(pdf, 8.5, false, muted);
  pdf.text(
    ['Escanee el QR o abra el enlace para verificar', 'el registro y la condición de la persona.'],
    x,
    y + 14,
  );
  textStyle(pdf, 8, false, green);
  pdf.text(url, x, linkY, { lineHeightFactor: 1.2 });
  pdf.link(x, linkY - 3, textWidth, url.length * lineStep(8) + 1, { url: data.verificationUrl });
  textStyle(pdf, 7.5, false, muted);
  pdf.text(hash, x, hashY, { lineHeightFactor: 1.2 });
  pdf.addImage(qr, 'PNG', qrX, y + 5, qrSize, qrSize);
  pdf.link(qrX, y + 5, qrSize, qrSize, { url: data.verificationUrl });
}

function drawAttendanceAnnex(pdf: jsPDF, sections: readonly AttendanceSection[]) {
  pdf.addPage();
  let y = annexTop;

  for (const { titulo, rows } of sections) {
    if (y + 29 > pdf.internal.pageSize.getHeight() - bottom) {
      pdf.addPage();
      y = annexTop;
    }
    y = drawTable(pdf, {
      startY: y,
      head: [
        [{ content: titulo, colSpan: 3, styles: { fillColor: green, textColor: 255, fontSize: 10 } }],
        ['Fecha', 'Actividad', 'Estado'],
      ],
      body: rows.length > 0
        ? rows.map(({ fecha, evento, estado }) => [fecha, evento, attendanceLabels[estado]])
        : [[{ content: 'Sin registros de asistencia para mostrar.', colSpan: 3, styles: { textColor: muted } }]],
      columnStyles: { 0: { cellWidth: 27 }, 2: { cellWidth: 31 } },
    }) + 8;
  }
}

function drawPageReferences(pdf: jsPDF, codigo: string) {
  const total = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const right = pageWidth - margin;
  const footerY = pdf.internal.pageSize.getHeight() - 14;

  for (let page = 1; page <= total; page += 1) {
    pdf.setPage(page);
    if (page > 1) {
      pdf.setFillColor(...green);
      pdf.rect(0, 0, pageWidth, 4, 'F');
      textStyle(pdf, 15, true);
      pdf.text('Anexo informativo de asistencia', margin, 19);
      textStyle(pdf, 9, false, muted);
      pdf.text('Historial de faenas y asambleas. La verificación pública acredita el registro y la condición.', margin, 28);
    }
    pdf.setDrawColor(...rule);
    pdf.line(margin, footerY, right, footerY);
    textStyle(pdf, 8, false, muted);
    pdf.text(codigo, margin, footerY + 6);
    pdf.text(`Página ${page} de ${total}`, right, footerY + 6, { align: 'right' });
  }
  pdf.setPage(1);
}

export async function createPersonaConstanciaPdf(data: ConstanciaPdfData) {
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true,
    putOnlyUsedFonts: true,
  });
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const qr = await QRCode.toDataURL(data.verificationUrl, {
    errorCorrectionLevel: 'M',
    margin: 4,
    width: 360,
  });
  const sections = [
    { titulo: 'Faenas', rows: data.faenas },
    { titulo: 'Asambleas', rows: data.asambleas },
  ];

  pdf.setProperties({ title: 'Constancia de registro y condición', subject: data.codigo });
  const registrationEnd = drawRegistration(pdf, data, width);
  const summaryEnd = drawSummary(pdf, sections, registrationEnd + 9);
  drawVerification(pdf, data, qr, width, summaryEnd + 8);

  if (sections.some(({ rows }) => rows.length > 0)) drawAttendanceAnnex(pdf, sections);
  drawPageReferences(pdf, data.codigo);
  return pdf;
}
