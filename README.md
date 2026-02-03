# Strict FAQ Generator (Antigravity)

## Project Overview
The Strict FAQ Generator is a web-based application developed using Antigravity.
It generates multiple-choice FAQs strictly from a given source document to ensure accuracy, traceability, and prevention of hallucinated content.

This project is designed for compliance-critical use cases where all generated information must be directly derived from the original source.

---

## Problem Statement
As a content or compliance manager, the goal is to generate FAQs strictly from source content so that the information remains accurate, reliable, and fully traceable.

---

## Inputs
- Source Document (plain text)

---

## Outputs
- Exactly five (5) FAQs
- Each FAQ contains:
  - Question
  - Four multiple-choice options (A, B, C, D)
  - One correct answer
  - A verbatim reference line from the source document

---

## Acceptance Criteria
- The system generates exactly five FAQs
- Each answer is strictly derived from the source text
- Each FAQ includes a direct reference line copied verbatim from the source
- No assumptions or external information are added
- The output is fully traceable to the original document
- Hallucinated content is prevented

---

## Features
- Strict source-based FAQ generation
- MCQ format with 4 options per question
- Correct answer highlighted in green
- Incorrect answers highlighted in red
- Displays correct answer and reference line after selection
- Mock data mode for offline demonstration (no API key required)
- API-ready architecture for future LLM integration

---

## How It Works
1. User pastes the source document into the input field
2. The system extracts factual statements
3. FAQs are generated strictly from the source
4. Each FAQ is presented in multiple-choice format
5. User selects an option
6. Correct and incorrect answers are highlighted
7. The correct answer and reference line are displayed

---

## Tech Stack
- HTML
- CSS
- JavaScript
- Antigravity (Prompt-based AI system)

---

## Usage
1. Open the application in a web browser
2. Paste the source document into the input box
3. Click **Generate FAQs**
4. Select an answer for each question
5. View the correct answer and reference line

---

## Note
Live LLM API integration is configurable.
Mock data is used for offline testing and project demonstration when no API key is provided.

---

## Future Enhancements
- Live AI integration using Gemini / OpenAI / Claude
- Support for multiple domains (education, sports, travel, industry)
- Difficulty levels for MCQs
- Export FAQs as JSON or PDF

---

## Author
**Perumal**
