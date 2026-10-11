import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Unicode fonts (Arial from Windows)
font_dir = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("Arial", os.path.join(font_dir, "arial.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Bold", os.path.join(font_dir, "arialbd.ttf")))
pdfmetrics.registerFont(TTFont("Arial-Italic", os.path.join(font_dir, "ariali.ttf")))

def create_zadani_pdf(filename="1_ZADANI_PROJ6_Bauyrzahnuly.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=1.8 * cm,
        leftMargin=1.8 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Arial-Bold',
        fontSize=15,
        leading=19,
        textColor=colors.HexColor('#003366'),
        alignment=1, # Center
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Arial',
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor('#4A5568'),
        alignment=1,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        fontName='Arial-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#003366'),
        spaceBefore=7,
        spaceAfter=3
    )

    body_style = ParagraphStyle(
        'Body',
        fontName='Arial',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=3
    )

    body_bold = ParagraphStyle(
        'BodyBold',
        fontName='Arial-Bold',
        fontSize=9,
        leading=12.5,
        textColor=colors.HexColor('#1A202C')
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        fontName='Arial',
        fontSize=8.8,
        leading=12,
        textColor=colors.HexColor('#2D3748'),
        leftIndent=12,
        spaceAfter=2.5
    )

    story = []

    # University Header
    story.append(Paragraph("Czech Technical University in Prague (CTU) | Faculty of Electrical Engineering", 
                           ParagraphStyle('Uni', fontName='Arial-Bold', fontSize=12, alignment=1, textColor=colors.HexColor('#1A202C'))))
    story.append(Paragraph("Course: B4BPROJ6 – Individual Project (Samostatný projekt) / Bachelor's Thesis Proposal", 
                           ParagraphStyle('Fac', fontName='Arial', fontSize=9.5, alignment=1, textColor=colors.HexColor('#4A5568'), spaceAfter=8)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#003366'), spaceAfter=10))

    story.append(Paragraph("PROJECT SPECIFICATION & ASSIGNMENT (TASK 1_ZADANI)", title_style))
    story.append(Paragraph("Foundation for Bachelor's Thesis | Academic Year 2026/2027", subtitle_style))

    # Meta Table
    meta_data = [
        [Paragraph("Student:", body_bold), Paragraph("Yernur Bauyrzahnuly", body_style)],
        [Paragraph("Student Email:", body_bold), Paragraph("bauyryer@cvut.cz", body_style)],
        [Paragraph("Study Programme:", body_bold), Paragraph("Software Engineering and Technology (SIT)", body_style)],
        [Paragraph("Field of Study:", body_bold), Paragraph("Business Informatics", body_style)],
        [Paragraph("Course & Term:", body_bold), Paragraph("B4BPROJ6 – Individual Project, Winter Term 2026/2027", body_style)],
        [Paragraph("Department:", body_bold), Paragraph("Department of Computer Science (K13136) / Computer Graphics and Interaction (K13139)", body_style)],
        [Paragraph("Supervisor:", body_bold), Paragraph("In negotiation / Department Assignment", body_style)],
        [Paragraph("GitHub Repository:", body_bold), Paragraph('<font color="#003366"><u>https://github.com/yeronymus/immersgerman</u></font>', body_style)],
        [Paragraph("Project Title (EN):", body_bold), Paragraph("<b>ImmersGerman: Intelligent Language Learning Platform with Automated CEFR-Level Difficulty Classification of German Audiovisual Content</b>", body_style)],
        [Paragraph("Project Title (CZ):", body_bold), Paragraph("<b>ImmersGerman: Inteligentní platforma pro jazykovou výuku s automatizovanou klasifikací obtížnosti německého multimediálního obsahu dle SERR</b>", body_style)],
    ]

    t_meta = Table(meta_data, colWidths=[3.8*cm, 13.6*cm])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 6))

    # Context & Motivation
    story.append(Paragraph("1. Motivation & Context (Business Informatics Relevance)", h1_style))
    story.append(Paragraph(
        "Modern foreign language acquisition relies on Stephen Krashen's <i>Comprehensible Input</i> hypothesis (i+1), "
        "stipulating that learners advance fastest when consuming native content matched to their exact linguistic proficiency. "
        "Currently, digital multimedia platforms (e.g., YouTube) lack standardized linguistic indexing aligned with the "
        "Common European Framework of Reference for Languages (CEFR / SERR, levels A1–C1). "
        "In the context of <b>Business Informatics</b>, this project solves educational resource discovery bottlenecks, "
        "applies intelligent data processing pipelines, and designs a scalable web platform combining Natural Language Processing (NLP), "
        "Large Language Models (LLM), and user-centric learning workflows.",
        body_style
    ))

    # Guidelines
    story.append(Paragraph("2. Project Guidelines & Assignment Objectives", h1_style))
    instructions = [
        "<b>1. Domain Research & Theoretical Framework:</b> Review CEFR benchmarks for German (Goethe vocabulary frequency, Profil Deutsch, grammatical markers) and explore automated text readability metrics along with modern LLM scoring approaches.",
        "<b>2. System Architecture & Data Engineering:</b> Architect an automated pipeline to ingest German audiovisual content, extract subtitles/transcripts, and manage metadata via a resilient database schema (PostgreSQL with JSONB and GIN indexing).",
        "<b>3. Linguistic Classification Core (Hybrid NLP + LLM):</b> Design and implement a classification engine combining speech rate dynamics (Words Per Minute — WPM), lexical frequency matching, and local LLM reasoning (Llama 3 via Ollama) to output CEFR levels and grammatical tags.",
        "<b>4. Web Application Development:</b> Develop a full-featured web client (Next.js, Tailwind CSS) featuring synchronized transcript playback, Yomitan popup dictionary integration, sentence/audio Anki card export (.vtt endpoint), and an administrative verification portal.",
        "<b>5. Experimental Evaluation & Validation:</b> Evaluate classification reliability against a benchmark dataset of German pedagogical and native content; assess processing latency and system usability."
    ]
    for ins in instructions:
        story.append(Paragraph(f"• {ins}", bullet_style))

    # Deliverables
    story.append(Paragraph("3. Expected Deliverables", h1_style))
    outputs = [
        "<b>Production Prototype:</b> Full open-source codebase available at <font color='#003366'><u>https://github.com/yeronymus/immersgerman</u></font>.",
        "<b>Experimental Evaluation:</b> Benchmarking accuracy and performance of zero-shot LLM inference versus the proposed hybrid classifier.",
        "<b>Technical Report (Závěrečná zpráva):</b> Formal academic paper (minimum 10 standard pages) following Bachelor's Thesis formatting rules.",
        "<b>Defense Presentation:</b> Slide deck summarizing methodology and outcomes for the final project defense."
    ]
    for out in outputs:
        story.append(Paragraph(f"• {out}", bullet_style))

    # Milestones
    story.append(Paragraph("4. Project Milestones (Winter Term 2026/2027)", h1_style))
    milestones = [
        [Paragraph("<b>Timeline</b>", body_bold), Paragraph("<b>Key Milestones & Activities</b>", body_bold)],
        [Paragraph("October 2026", body_style), Paragraph("Project specification, literature review on CEFR metrics, architecture definition.", body_style)],
        [Paragraph("November 2026", body_style), Paragraph("Benchmark dataset collection, hybrid classifier development (WPM + Lexical + Ollama).", body_style)],
        [Paragraph("December 2026", body_style), Paragraph("Interactive player UI, Yomitan DOM compatibility, Anki .vtt export, admin moderation panel.", body_style)],
        [Paragraph("January 17, 2027", body_style), Paragraph("Final submission to BRUTE (task 2_VYSLEDKY: report min. 10 pages, code, screenshots).", body_style)],
        [Paragraph("January 2027", body_style), Paragraph("Project presentation & defense (task 4_PREZENT), grading and course credit.", body_style)],
    ]
    t_milestones = Table(milestones, colWidths=[3.2*cm, 14.2*cm])
    t_milestones.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EDF2F7')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_milestones)

    story.append(Spacer(1, 10))

    # Signature block
    sig_data = [
        [Paragraph("Date: October 11, 2026", body_style), Paragraph("", body_style)],
        [Spacer(1, 10), Spacer(1, 10)],
        [Paragraph("....................................................<br/><b>Student Signature</b>", body_style),
         Paragraph("....................................................<br/><b>Supervisor / Department Chair Signature</b>", body_style)]
    ]
    t_sig = Table(sig_data, colWidths=[8.7*cm, 8.7*cm])
    t_sig.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_sig)

    doc.build(story)
    print(f"PDF successfully generated: {filename}")

if __name__ == "__main__":
    create_zadani_pdf()
