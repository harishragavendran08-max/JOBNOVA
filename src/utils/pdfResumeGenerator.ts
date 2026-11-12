import { jsPDF } from 'jspdf';
import { ResumeDocumentData } from './jobnovaLogic';

export interface GeneratedPdfResult {
  fileName: string;
  byteLength: number;
  timestamp: string;
}

/**
 * Generates and triggers a browser download of a formatted A4 PDF resume
 * from the student's current profile, listed skills, and tracked certifications.
 */
export function exportStudentResumePdf(
  resume: ResumeDocumentData,
  options: {
    includeCourses?: boolean;
    includeTargetRoles?: boolean;
  } = { includeCourses: true, includeTargetRoles: true }
): GeneratedPdfResult {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // 1. Top Header Accent Bar
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 6, 'F');

  // 2. Full Name & Headline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(resume.fullName, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(resume.headline, margin, y);
  y += 6;

  // Contact Metadata Line
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  const contactLine = `${resume.email}  ·  ${resume.location}  ·  Verified via ${resume.oauthProvider} OAuth2`;
  doc.text(contactLine, margin, y);
  y += 6;

  // Hairline Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Helper for Section Headings
  const drawSectionHeading = (title: string) => {
    if (y > 265) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // 3. Professional Summary
  drawSectionHeading('Professional Summary');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(resume.summary, contentWidth);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 5;

  // 4. Technical Skills & Proficiency
  drawSectionHeading('Technical Skills & Competency');
  if (resume.skills.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No skills listed yet.', margin, y);
    y += 7;
  } else {
    const colWidth = contentWidth / 2;
    resume.skills.forEach((sk, idx) => {
      const col = idx % 2;
      const xPos = margin + col * colWidth;
      if (col === 0 && idx > 0) {
        y += 8;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(sk.name, xPos, y);

      doc.setFont('courier', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(79, 70, 229);
      doc.text(`${sk.proficiency}%`, xPos + colWidth - 16, y);

      // Subtle bar background
      const barWidth = colWidth - 48;
      const barX = xPos + 28;
      doc.setFillColor(241, 245, 249);
      doc.rect(barX, y - 2.8, barWidth, 2.5, 'F');
      doc.setFillColor(79, 70, 229);
      doc.rect(barX, y - 2.8, (barWidth * sk.proficiency) / 100, 2.5, 'F');
    });
    y += 11;
  }

  // 5. Tracked Industry Certifications
  drawSectionHeading(`Tracked Industry Certifications (${resume.trackedCertifications.length})`);
  if (resume.trackedCertifications.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No certifications currently tracked on JobNova.', margin, y);
    y += 7;
  } else {
    resume.trackedCertifications.forEach((cert) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${cert.name}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Issuer: ${cert.issuer}`, pageWidth - margin, y, { align: 'right' });
      y += 4.5;

      doc.setFont('courier', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`  Credential URL: ${cert.credentialUrl}`, margin, y);
      y += 6.5;
    });
    y += 2;
  }

  // 6. Optional: Enrolled Learning Courses
  if (options.includeCourses && resume.enrolledCourses.length > 0) {
    drawSectionHeading(`Enrolled Coursework & Upskilling (${resume.enrolledCourses.length})`);
    resume.enrolledCourses.forEach((course) => {
      if (y > 272) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${course.title}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`${course.provider} · ${course.level}`, pageWidth - margin, y, {
        align: 'right'
      });
      y += 6;
    });
    y += 3;
  }

  // 7. Optional: Saved / Target Job Roles
  if (options.includeTargetRoles && resume.targetRoles.length > 0) {
    drawSectionHeading(`Saved / Applied Career Roles (${resume.targetRoles.length})`);
    resume.targetRoles.forEach((role) => {
      if (y > 272) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${role.title} — ${role.company}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(role.location, pageWidth - margin, y, { align: 'right' });
      y += 6;
    });
  }

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by JobNova Career Platform · ${resume.generatedDate}`,
    margin,
    287
  );

  const arrayBuffer = doc.output('arraybuffer');
  doc.save(resume.fileName);

  return {
    fileName: resume.fileName,
    byteLength: arrayBuffer.byteLength,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
