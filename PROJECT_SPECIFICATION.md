# ImmersGerman — Project Specification & Bachelor's Thesis Proposal

**Course:** B4BPROJ6 – Individual Project (*Samostatný projekt*) / Bachelor's Thesis Proposal  
**Faculty:** Faculty of Electrical Engineering (FEE), Czech Technical University in Prague (CTU)  
**Study Programme:** Software Engineering and Technology (SIT)  
**Field of Study:** Business Informatics  
**Student:** Yernur Bauyrzahnuly (`bauyryer@cvut.cz`)  
**Repository:** [https://github.com/yeronymus/immersgerman](https://github.com/yeronymus/immersgerman)  
**Supervisor:** In negotiation / CTU Academic Supervisor  

---

## 1. Project Title
- **English Title:** **ImmersGerman: Intelligent Language Learning Platform with Automated CEFR-Level Difficulty Classification of German Audiovisual Content**
- **Czech Title:** **ImmersGerman: Inteligentní platforma pro jazykovou výuku s automatizovanou klasifikací obtížnosti německého multimediálního obsahu dle SERR**

---

## 2. Motivation & Business/Educational Context
Language acquisition, particularly German, heavily relies on Stephen Krashen's *Comprehensible Input* hypothesis (\(i + 1\)): learners achieve optimal retention when consuming authentic multimedia materials just slightly above their current competency level. 

In today's digital landscape, learners face a significant discovery bottleneck: YouTube and other media hosting platforms lack standardized linguistic metadata calibrated to the **Common European Framework of Reference for Languages (CEFR / SERR)**, ranging from Beginner (A1) to Advanced (C1).

From the perspective of **Business Informatics** and software engineering, **ImmersGerman** addresses:
1. **Automation of educational content discovery:** Eliminating manual search inefficiencies through an automated ingestion and processing pipeline.
2. **Hybrid Linguistic Intelligence:** Combining deterministic Natural Language Processing (speech speed WPM, Goethe lexical profiles) with localized Large Language Model (LLM) classification.
3. **Productivity-oriented Learning Workflow:** Seamless integration with standard spaced-repetition memory tools (Anki via `.vtt` export and Yomitan-compatible browser extensions).

---

## 3. Project Scope & Guidelines (Guidelines for Semestral Project & Thesis)

1. **Domain Research & State-of-the-Art Analysis:**
   - Conduct a systematic literature review on CEFR linguistic benchmarks for the German language (lexical frequency profiles, syntactic complexity, Profil Deutsch).
   - Review automated text readability algorithms (e.g., LIX, Flesch Reading Ease adapted for German) and current methodologies leveraging Large Language Models (LLMs) for automated essay scoring and language proficiency classification.

2. **System Architecture & Data Pipeline Design:**
   - Design a modular, production-ready system architecture consisting of:
     - Asynchronous backend ETL pipeline for video ingestion and transcript retrieval.
     - Database persistence layer optimized for full-text and tag indexing (PostgreSQL with JSONB subtitles).
     - Reactive web user interface with responsive multimedia playback.

3. **Classification Engine Development (NLP & LLM):**
   - Implement an automated classification pipeline synthesizing:
     - **Acoustic/Speech Dynamics:** Speech tempo measured in Words Per Minute (WPM) with threshold adaptation.
     - **Lexical Benchmarking:** Matching transcript tokens against official Goethe-Zertifikat A1–C1 vocabulary lists.
     - **Contextual LLM Evaluation:** Controlled prompting and structured JSON output using open-source models (Llama 3 via Ollama) to extract grammar tags and CEFR assessments.
   - Benchmark model performance against a curated validation dataset of German pedagogical and authentic videos.

4. **Web Platform & Integration Development:**
   - Develop a high-performance web application (Next.js, Tailwind CSS) featuring:
     - Interactive video player with synchronized, clickable subtitles.
     - Hover-based dictionary lookup support (Yomitan) and single-click sentence mining.
     - Administrative review dashboard for quality assurance, tag moderation, and pipeline monitoring.

5. **Evaluation, Testing, and Reporting:**
   - Validate classification precision, recall, and runtime latency.
   - Author a comprehensive technical report (minimum 10 standard pages for B4BPROJ6, expandable into the final Bachelor's Thesis) adhering to CTU academic standards.

---

## 4. Expected Project Deliverables
- **Functional Software Prototype:** Open-source web application, ETL daemon, and database schema hosted at [https://github.com/yeronymus/immersgerman](https://github.com/yeronymus/immersgerman).
- **Evaluation Benchmark:** Empirical comparison of pure LLM zero-shot inference versus the hybrid (WPM + Lexical + LLM) classification approach.
- **Project Report (Závěrečná zpráva):** Complete academic documentation detailing research, architecture, implementation, and verification.
- **Defense Presentation:** Slide deck for the final project defense before the supervisor and committee.

---

## 5. Technology Stack
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
- **Backend & ETL:** Python 3.11+, FastAPI, yt-dlp, youtube-transcript-api.
- **AI / NLP Engine:** Ollama (`llama3:8b-instruct`), spaCy German linguistic models.
- **Database:** PostgreSQL / Supabase (JSONB subtitles, GIN tag indexing).
- **DevOps & Infrastructure:** Docker Compose, Traefik v3, HashiCorp Vault, Prometheus & Alertmanager.
