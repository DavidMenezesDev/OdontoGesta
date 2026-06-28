import jsPDF from "jspdf";
import type { Enterprise, Patient } from "../types";

export interface PdfAnswer {
  pergunta: string;
  resposta: string;
}

export function exportAnamnesisPdf(
  enterprise: Enterprise | null,
  patient: Patient,
  anamnesisNome: string,
  answers: PdfAnswer[],
  createdAt: string,
) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const clinicName = enterprise?.nome || "OdontoGestão";
  const clinicCnpj = enterprise?.cnpj || "";
  const clinicPhone = enterprise?.phone || "";
  const clinicEmail = enterprise?.email || "";
  const clinicAddress = [enterprise?.street, enterprise?.number, enterprise?.neighborhood, enterprise?.city, enterprise?.state]
    .filter(Boolean)
    .join(", ");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(clinicName, pageWidth / 2, y, { align: "center" });
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  const clinicLines: string[] = [];
  if (clinicCnpj) clinicLines.push(`CNPJ: ${clinicCnpj}`);
  if (clinicPhone) clinicLines.push(`Tel: ${clinicPhone}`);
  if (clinicEmail) clinicLines.push(`E-mail: ${clinicEmail}`);
  if (clinicAddress) clinicLines.push(`End: ${clinicAddress}`);
  for (const line of clinicLines) {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4.5;
  }

  y += 4;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Ficha do Paciente - Anamnese", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Dados do Paciente", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  function addField(label: string, value: string | null | undefined) {
    if (!value) return;
    const val = `${label}: ${value}`;
    if (y > 275) {
      doc.addPage();
      y = margin;
    }
    doc.text(val, margin, y);
    y += 4.5;
  }

  addField("Nome", patient.name);
  addField("CPF", patient.document);
  addField("Data de Nascimento", patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR") : null);
  addField("Telefone", patient.phone);
  addField("E-mail", patient.email);
  addField("Nº Prontuário", patient.recordNumber);
  addField("Plano de Saúde", patient.healthPlan?.name);

  y += 3;
  doc.setDrawColor(200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Anamnese: ${anamnesisNome}`, margin, y);
  y += 3;

  if (createdAt) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Realizada em: ${new Date(createdAt).toLocaleDateString("pt-BR")}`, margin, y);
    y += 2;
    doc.setTextColor(0);
  }

  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const answer of answers) {
    if (y > 272) {
      doc.addPage();
      y = margin;
    }

    const questionText = answer.pergunta;
    const answerText = answer.resposta || "—";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    const splitQuestion = doc.splitTextToSize(questionText, contentWidth);
    for (const line of splitQuestion) {
      if (y > 275) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 4.5;
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);

    const splitAnswer = doc.splitTextToSize(answerText, contentWidth);
    for (const line of splitAnswer) {
      if (y > 275) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 3, y);
      y += 4;
    }

    doc.setTextColor(0);
    y += 1.5;
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Documento gerado em ${new Date().toLocaleString("pt-BR")} pelo OdontoGestão`,
    pageWidth / 2,
    290,
    { align: "center" },
  );

  doc.save(`anamnese-${patient.name.replace(/\s+/g, "_")}.pdf`);
}
