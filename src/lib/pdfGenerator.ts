import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Project } from '../types';

export const generateProjectPDF = (project: Project) => {
  const doc = new jsPDF() as any;
  
  // Colors
  const primaryColor = [30, 64, 175]; // blue-800
  const secondaryColor = [5, 150, 105]; // emerald-600
  const textColor = [31, 41, 55]; // gray-800
  const lightTextColor = [107, 114, 128]; // gray-500

  // Header
  doc.setFontSize(24);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('SolarPump Pro', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistemas de Bombeo Solar de Alta Eficiencia', 14, 26);
  
  doc.setFontSize(10);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Folio: ${project.id}`, 150, 20);
  doc.text(`Fecha: ${new Date(project.createdAt).toLocaleDateString()}`, 150, 26);

  // Divider
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 32, 196, 32);

  // Client Info Section
  doc.setFillColor(249, 250, 251);
  doc.rect(14, 38, 182, 35, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('INFORMACIÓN DEL CLIENTE', 20, 46);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(`Cliente: ${project.data.client.nombre}`, 20, 53);
  doc.text(`Contacto: ${project.data.client.contacto}`, 20, 59);
  doc.text(`Email: ${project.data.client.email}`, 20, 65);
  doc.text(`Ubicación: ${project.data.client.municipio}, ${project.data.client.estado}`, 110, 53);
  doc.text(`Teléfono: ${project.data.client.telefono}`, 110, 59);

  // Technical Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('ESPECIFICACIONES TÉCNICAS', 14, 85);
  
  const techData = [
    ['Carga Dinámica Total (HMT)', `${project.calculations.HMT} m`],
    ['Potencia de Bomba Requerida', `${project.calculations.potenciaBomba} kW`],
    ['Potencia Fotovoltaica Instalada', `${project.calculations.potenciaFV} kWp`],
    ['Número de Paneles Solares', `${project.calculations.numPaneles} unidades`],
    ['Producción de Agua Diaria Promedio', `${project.calculations.aguaDiaria} m³`],
    ['Tipo de Agua', project.data.well.tipoAgua],
    ['Profundidad del Pozo', `${project.data.well.profundidadTotal} m`],
  ];

  doc.autoTable({
    startY: 90,
    head: [['Parámetro Técnico', 'Valor Estimado']],
    body: techData,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 }
  });

  // Economic Summary
  const finalY = (doc as any).lastAutoTable.cursor.y;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('RESUMEN ECONÓMICO Y AMBIENTAL', 14, finalY + 15);

  const economicData = [
    ['Inversión Total (IVA Incluido)', `$${project.calculations.inversionTotal.toLocaleString()} MXN`],
    ['Retorno de Inversión (ROI)', `${project.calculations.roi} años`],
    ['Ahorro Anual Estimado', `$${(project.calculations.inversionTotal / project.calculations.roi).toLocaleString(undefined, { maximumFractionDigits: 0 })} MXN`],
    ['Emisiones de CO2 Evitadas', `${project.calculations.co2Evitado} toneladas / año`],
  ];

  doc.autoTable({
    startY: finalY + 20,
    head: [['Concepto', 'Monto / Impacto']],
    body: economicData,
    theme: 'grid',
    headStyles: { fillColor: secondaryColor, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 }
  });

  // Commercial Notes
  const notesY = (doc as any).lastAutoTable.cursor.y;
  if (project.data.commercial.notas) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text('NOTAS ADICIONALES', 14, notesY + 15);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    const splitNotes = doc.splitTextToSize(project.data.commercial.notas, 180);
    doc.text(splitNotes, 14, notesY + 22);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text('Esta cotización es una estimación técnica basada en los datos proporcionados. Sujeta a cambios tras visita técnica.', 105, pageHeight - 15, { align: 'center' });
  doc.text('Generado por SolarPump Pro - La solución inteligente para el campo.', 105, pageHeight - 10, { align: 'center' });

  doc.save(`Cotizacion_${project.data.client.nombre.replace(/\s+/g, '_')}_${project.id}.pdf`);
};
