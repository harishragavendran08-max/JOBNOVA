import { jsPDF } from 'jspdf';
import { ResumeDocumentData } from './jobnovaLogic';
import { ResumeSectionVisibility, ResumeTemplateId } from './resumeBuilderLogic';

export interface GeneratedPdfResult {
  fileName: string;
  byteLength: number;
  pageCount: number;
  timestamp: string;
}

export interface ExportResumePdfOptions {
  includeCourses?: boolean;
  includeTargetRoles?: boolean;
  template?: ResumeTemplateId;
  visibility?: Partial<ResumeSectionVisibility>;
}

/**
 * Generates and triggers a browser download of a structured, ATS-friendly A4 PDF resume
 * from the student's profile, education, experience, skills, certifications, and coursework.
 */
export function exportStudentResumePdf(
  resume: ResumeDocumentData,
  options: ExportResumePdfOptions = {}
): GeneratedPdfResult {
  const template: ResumeTemplateId = options.template || resume.template || 'modern';
  const visibility = (resume as ResumeDocumentData & { visibility?: ResumeSectionVisibility }).visibility;
  const includeCourses = options.includeCourses ?? (visibility ? visibility.showCourses : true);
  const includeTargetRoles =
    options.includeTargetRoles ?? (visibility ? visibility.showTargetRoles : true);
  const showSkillBars =
    options.visibility?.showSkillProficiencyBars ??
    visibility?.showSkillProficiencyBars ??
    resume.showSkillProficiencyBars ??
    (template !== 'classic' && !visibility);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = template === 'compact' ? 14 : 18;
  const contentWidth = pageWidth - margin * 2;
  const bottomLimit = pageHeight - 18;
  let y = template === 'compact' ? 16 : 20;

  // Color palette aligned to Indeed Cobalt & Clean Executive Slate
  const accentRgb: [number, number, number] =
    template === 'classic' ? [15, 23, 42] : [37, 87, 167]; // #0f172a vs #2557A7

  const ensureSpace = (requiredHeight = 14) => {
    if (y + requiredHeight > bottomLimit) {
      doc.addPage();
      y = 18;
    }
  };

  // 1. Top Header Bar (Modern & Compact templates)
  if (template === 'modern') {
    doc.setFillColor(37, 87, 167); // Indeed Cobalt Blue #2557A7
    doc.rect(0, 0, pageWidth, 5, 'F');
  } else if (template === 'compact') {
    doc.setFillColor(37, 87, 167);
    doc.rect(0, 0, pageWidth, 3, 'F');
  }

  // 2. Full Name & Headline
  doc.setFont(template === 'classic' ? 'times' : 'helvetica', 'bold');
  doc.setFontSize(template === 'compact' ? 19 : 22);
  doc.setTextColor(15, 23, 42);
  if (template === 'classic') {
    doc.text(resume.fullName, pageWidth / 2, y, { align: 'center' });
  } else {
    doc.text(resume.fullName, margin, y);
  }
  y += template === 'compact' ? 5.5 : 6.8;

  if (resume.headline) {
    doc.setFont(template === 'classic' ? 'times' : 'helvetica', 'normal');
    doc.setFontSize(template === 'compact' ? 10 : 11);
    doc.setTextColor(...accentRgb);
    const headlineLines = doc.splitTextToSize(resume.headline, contentWidth);
    if (template === 'classic') {
      doc.text(headlineLines, pageWidth / 2, y, { align: 'center' });
    } else {
      doc.text(headlineLines, margin, y);
    }
    y += headlineLines.length * 4.6 + 1;
  }

  // Contact Metadata Line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(71, 85, 105);
  const contactParts = [
    resume.email,
    resume.phone,
    resume.location,
    resume.linkedInProfileUrl,
    resume.githubOrPortfolioUrl
  ].filter(Boolean) as string[];
  const contactText =
    contactParts.length > 0
      ? contactParts.join('  |  ')
      : `${resume.email}  ·  ${resume.location}  ·  Verified via ${resume.oauthProvider} OAuth2`;
  const contactLines = doc.splitTextToSize(contactText, contentWidth);
  if (template === 'classic') {
    doc.text(contactLines, pageWidth / 2, y, { align: 'center' });
  } else {
    doc.text(contactLines, margin, y);
  }
  y += contactLines.length * 4 + 2.5;

  // Hairline Divider
  doc.setDrawColor(...accentRgb);
  doc.setLineWidth(template === 'classic' ? 0.5 : 0.4);
  doc.line(margin, y, pageWidth - margin, y);
  y += template === 'compact' ? 5.5 : 7;

  // Helper for Section Headings
  const drawSectionHeading = (title: string) => {
    ensureSpace(16);
    doc.setFont(template === 'classic' ? 'times' : 'helvetica', 'bold');
    doc.setFontSize(template === 'compact' ? 9.8 : 10.5);
    doc.setTextColor(...accentRgb);
    doc.text(title.toUpperCase(), margin, y);
    y += 1.8;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += template === 'compact' ? 4.5 : 5.5;
  };

  // 3. Professional Summary
  if (resume.summary) {
    drawSectionHeading('Professional Summary');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(template === 'compact' ? 9.2 : 9.8);
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(resume.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 4.4 + (template === 'compact' ? 3.5 : 5);
  }

  // 4. Work Experience & Engineering Projects
  const experiences = resume.experiences || [];
  if (experiences.length > 0) {
    drawSectionHeading('Experience & Projects');
    experiences.forEach((exp) => {
      const descLines = doc.splitTextToSize(exp.description || '', contentWidth - 4);
      ensureSpace(16 + descLines.length * 4.3);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${exp.title}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const dateStr = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;
      doc.text(dateStr, pageWidth - margin, y, { align: 'right' });
      y += 4.3;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(...accentRgb);
      const subLine = [exp.company, exp.location].filter(Boolean).join(' · ');
      doc.text(subLine, margin, y);
      y += 4.5;

      if (exp.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.2);
        doc.setTextColor(51, 65, 85);
        doc.text(descLines, margin + 2, y);
        y += descLines.length * 4.2;
      }

      if (exp.skillsUsed && exp.skillsUsed.length > 0) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(8.2);
        doc.setTextColor(100, 116, 139);
        doc.text(`Stack: ${exp.skillsUsed.join(', ')}`, margin + 2, y + 1);
        y += 4.2;
      }
      y += 3.2;
    });
  }

  // 5. Education
  const educationEntries = resume.educationEntries || [];
  if (educationEntries.length > 0) {
    drawSectionHeading('Education');
    educationEntries.forEach((edu) => {
      ensureSpace(14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.degree, margin, y);

      if (edu.period) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(edu.period, pageWidth - margin, y, { align: 'right' });
      }
      y += 4.3;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.3);
      doc.setTextColor(51, 65, 85);
      doc.text(edu.institution, margin, y);
      y += 4.3;

      if (edu.highlights) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.8);
        doc.setTextColor(71, 85, 105);
        doc.text(edu.highlights, margin, y);
        y += 4.5;
      }
      y += 2.5;
    });
  }

  // 6. Technical Skills & Proficiency
  if (resume.skills.length > 0) {
    drawSectionHeading('Technical Skills');
    if (!showSkillBars) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      const flatSkills = resume.skills.map((s) => s.name).join('  ·  ');
      const skillLines = doc.splitTextToSize(flatSkills, contentWidth);
      ensureSpace(skillLines.length * 4.5 + 4);
      doc.text(skillLines, margin, y);
      y += skillLines.length * 4.5 + 4;
    } else {
      const colWidth = contentWidth / 2;
      resume.skills.forEach((sk, idx) => {
        const col = idx % 2;
        const xPos = margin + col * colWidth;
        if (col === 0 && idx > 0) {
          y += 7.5;
          ensureSpace(10);
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.2);
        doc.setTextColor(30, 41, 59);
        doc.text(sk.name, xPos, y);

        doc.setFont('courier', 'bold');
        doc.setFontSize(8.8);
        doc.setTextColor(...accentRgb);
        doc.text(`${sk.proficiency}%`, xPos + colWidth - 15, y);

        const barWidth = colWidth - 48;
        const barX = xPos + 28;
        doc.setFillColor(241, 245, 249);
        doc.rect(barX, y - 2.6, barWidth, 2.3, 'F');
        doc.setFillColor(...accentRgb);
        doc.rect(barX, y - 2.6, (barWidth * sk.proficiency) / 100, 2.3, 'F');
      });
      y += 9.5;
    }
  }

  // 7. Tracked Industry Certifications
  if (resume.trackedCertifications.length > 0) {
    drawSectionHeading(`Certifications (${resume.trackedCertifications.length})`);
    resume.trackedCertifications.forEach((cert) => {
      ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${cert.name}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(cert.issuer, pageWidth - margin, y, { align: 'right' });
      y += 4.2;

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`  ${cert.credentialUrl}`, margin, y);
      y += 5.5;
    });
    y += 1.5;
  }

  // 8. Enrolled Coursework
  if (includeCourses && resume.enrolledCourses.length > 0) {
    drawSectionHeading(`Relevant Coursework (${resume.enrolledCourses.length})`);
    resume.enrolledCourses.forEach((course) => {
      ensureSpace(7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${course.title}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${course.provider} · ${course.level}`, pageWidth - margin, y, {
        align: 'right'
      });
      y += 5.2;
    });
    y += 2;
  }

  // 9. Target Roles (optional)
  if (includeTargetRoles && resume.targetRoles.length > 0) {
    drawSectionHeading(`Target Career Roles (${resume.targetRoles.length})`);
    resume.targetRoles.forEach((role) => {
      ensureSpace(7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.2);
      doc.setTextColor(30, 41, 59);
      doc.text(`• ${role.title} — ${role.company}`, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      doc.setTextColor(100, 116, 139);
      doc.text(role.location, pageWidth - margin, y, { align: 'right' });
      y += 5.2;
    });
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let pageIdx = 1; pageIdx <= pageCount; pageIdx++) {
    doc.setPage(pageIdx);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `JobNova Resume Builder · ${resume.fullName} · ${resume.generatedDate}`,
      margin,
      pageHeight - 9
    );
    if (pageCount > 1) {
      doc.text(`Page ${pageIdx} of ${pageCount}`, pageWidth - margin, pageHeight - 9, {
        align: 'right'
      });
    }
  }

  const arrayBuffer = doc.output('arraybuffer');
  doc.save(resume.fileName);

  return {
    fileName: resume.fileName,
    byteLength: arrayBuffer.byteLength,
    pageCount,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
