/**
 * FAQ Generator Application
 * AI-Powered Compliance-Critical Content Generation Tool
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
    API_KEY: 'AIzaSyBFRdK8NWCXK8Enwx6ucFbXBmiVuwToCHg',
    API_PROVIDER: 'gemini'
};

// ========================================
// State Management
// ========================================
const MAX_FAQS = 5;
let faqData = [];

// ========================================
// DOM Elements
// ========================================
const elements = {
    sourceDocument: document.getElementById('sourceDocument'),
    charCount: document.getElementById('charCount'),
    faqCards: document.getElementById('faqCards'),
    faqCounter: document.getElementById('faqCounter'),
    addFaqBtn: document.getElementById('addFaqBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    exportBtn: document.getElementById('exportBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    copyPromptBtn: document.getElementById('copyPromptBtn'),
    generateBtn: document.getElementById('generateBtn'),
    faqTemplate: document.getElementById('faqTemplate'),
    toast: document.getElementById('toast'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    apiProvider: document.getElementById('apiProvider'),
    apiKey: document.getElementById('apiKey'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    toggleApiSettings: document.getElementById('toggleApiSettings'),
    apiSettings: document.getElementById('apiSettings')
};

// ========================================
// AI Prompt Template (JSON Format)
// ========================================
const FAQ_PROMPT_TEMPLATE = `You are a strict MCQ-based FAQ generation system designed for compliance-critical content.

GOAL:
Generate multiple-choice FAQs strictly and exclusively from the provided Source Document so that the output is accurate, traceable, and free from hallucinations.

MANDATORY RULES:
1. Use ONLY the information explicitly present in the Source Document.
2. Do NOT add assumptions, interpretations, or external knowledge.
3. Do NOT hallucinate or infer missing details.
4. Generate EXACTLY five (5) FAQs — no more, no less.
5. Each FAQ MUST include:
   - question
   - options: exactly four (4) options labeled A, B, C, and D
   - correct_option: the letter (A/B/C/D) of the correct answer
   - correct_answer_text: the text of the correct option
   - reference_line: an EXACT verbatim sentence copied from the Source Document
6. Only ONE option must be correct.
7. The correct option MUST be directly supported by the reference_line.
8. Incorrect options must be plausible but incorrect and must NOT introduce new facts outside the source.
9. Do NOT include explanations, headings, or any extra text.

STRICT OUTPUT FORMAT (JSON ONLY):

{
  "faqs": [
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct_option": "",
      "correct_answer_text": "",
      "reference_line": ""
    },
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct_option": "",
      "correct_answer_text": "",
      "reference_line": ""
    },
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct_option": "",
      "correct_answer_text": "",
      "reference_line": ""
    },
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct_option": "",
      "correct_answer_text": "",
      "reference_line": ""
    },
    {
      "question": "",
      "options": {
        "A": "",
        "B": "",
        "C": "",
        "D": ""
      },
      "correct_option": "",
      "correct_answer_text": "",
      "reference_line": ""
    }
  ]
}

SOURCE DOCUMENT:
"""
{SOURCE_TEXT}
"""`;

// ========================================
// Utility Functions
// ========================================

function showToast(message, type = 'success') {
    const toast = elements.toast;
    const messageSpan = toast.querySelector('.toast-message');

    toast.className = 'toast';
    toast.classList.add(type);
    messageSpan.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateFaqCounter() {
    elements.faqCounter.textContent = `${faqData.length}/${MAX_FAQS}`;
    elements.addFaqBtn.disabled = faqData.length >= MAX_FAQS;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function setLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
}

function getFullPrompt() {
    const sourceText = elements.sourceDocument.value.trim();
    return FAQ_PROMPT_TEMPLATE.replace('{SOURCE_TEXT}', sourceText);
}

// ========================================
// FAQ Management Functions
// ========================================

function createFaqObject(data = {}) {
    return {
        id: generateId(),
        question: data.question || '',
        options: {
            A: data.optionA || '',
            B: data.optionB || '',
            C: data.optionC || '',
            D: data.optionD || ''
        },
        correctOption: data.correctOption || null,
        referenceLine: data.referenceLine || ''
    };
}

function findFaqIndex(id) {
    return faqData.findIndex(faq => faq.id === id);
}

function addFaq(data = {}) {
    if (faqData.length >= MAX_FAQS) {
        showToast('Maximum 5 FAQs allowed', 'error');
        return null;
    }

    const newFaq = createFaqObject(data);
    faqData.push(newFaq);
    renderFaq(newFaq, faqData.length);
    updateFaqCounter();

    if (!data.question) {
        showToast('FAQ added successfully');
    }

    return newFaq;
}

function deleteFaq(id) {
    const index = findFaqIndex(id);
    if (index !== -1) {
        faqData.splice(index, 1);
        renderAllFaqs();
        updateFaqCounter();
        showToast('FAQ deleted');
    }
}

function updateFaq(id, field, value) {
    const index = findFaqIndex(id);
    if (index !== -1) {
        if (field.startsWith('option_')) {
            const optionKey = field.split('_')[1];
            faqData[index].options[optionKey] = value;
        } else {
            faqData[index][field] = value;
        }
    }
}

// ========================================
// Rendering Functions
// ========================================

function renderFaq(faq, number) {
    const template = elements.faqTemplate.content.cloneNode(true);
    const card = template.querySelector('.faq-card');

    card.dataset.faqId = faq.id;
    card.querySelector('.number').textContent = number;

    const questionInput = card.querySelector('.question-input');
    questionInput.value = faq.question;
    questionInput.addEventListener('input', (e) => {
        updateFaq(faq.id, 'question', e.target.value);
    });

    const optionInputs = card.querySelectorAll('.option-input');
    optionInputs.forEach(input => {
        const option = input.dataset.option;
        input.value = faq.options[option];
        input.addEventListener('input', (e) => {
            updateFaq(faq.id, `option_${option}`, e.target.value);
            updateAnswerDisplay(card, faq.id);
        });
    });

    const correctBtns = card.querySelectorAll('.correct-btn');
    correctBtns.forEach(btn => {
        const option = btn.dataset.option;
        if (faq.correctOption === option) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            setCorrectAnswer(card, faq.id, option);
        });
    });

    const referenceInput = card.querySelector('.reference-input');
    referenceInput.value = faq.referenceLine;
    referenceInput.addEventListener('input', (e) => {
        updateFaq(faq.id, 'referenceLine', e.target.value);
    });

    const deleteBtn = card.querySelector('.delete-faq-btn');
    deleteBtn.addEventListener('click', () => {
        deleteFaq(faq.id);
    });

    updateAnswerDisplay(card, faq.id);
    elements.faqCards.appendChild(card);
}

function renderAllFaqs() {
    elements.faqCards.innerHTML = '';
    faqData.forEach((faq, index) => {
        renderFaq(faq, index + 1);
    });
}

function setCorrectAnswer(card, id, option) {
    const index = findFaqIndex(id);
    if (index === -1) return;

    faqData[index].correctOption = option;

    const buttons = card.querySelectorAll('.correct-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.option === option) {
            btn.classList.add('active');
        }
    });

    updateAnswerDisplay(card, id);
}

function updateAnswerDisplay(card, id) {
    const index = findFaqIndex(id);
    if (index === -1) return;

    const faq = faqData[index];
    const answerText = card.querySelector('.answer-text');

    if (faq.correctOption && faq.options[faq.correctOption]) {
        answerText.textContent = `${faq.correctOption}) ${faq.options[faq.correctOption]}`;
        answerText.classList.remove('placeholder');
    } else {
        answerText.textContent = 'Select the correct option above';
        answerText.classList.add('placeholder');
    }
}

// ========================================
// AI Generation Functions
// ========================================

function parseAIResponse(response) {
    const faqs = [];

    try {
        let jsonStr = response;

        // Handle markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1].trim();
        }

        // Find JSON object
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }

        const parsed = JSON.parse(jsonStr);

        if (parsed.faqs && Array.isArray(parsed.faqs)) {
            parsed.faqs.forEach(faq => {
                faqs.push({
                    question: faq.question || '',
                    optionA: faq.options?.A || '',
                    optionB: faq.options?.B || '',
                    optionC: faq.options?.C || '',
                    optionD: faq.options?.D || '',
                    correctOption: (faq.correct_option || '').toUpperCase(),
                    referenceLine: faq.reference_line || ''
                });
            });
        }
    } catch (jsonError) {
        console.log('JSON parsing failed, trying text format...');

        // Fallback regex parsing
        const faqRegex = /FAQ\s*(\d+):\s*Question:\s*([\s\S]*?)A\)\s*([\s\S]*?)B\)\s*([\s\S]*?)C\)\s*([\s\S]*?)D\)\s*([\s\S]*?)Correct Answer:\s*([A-D])\)?\s*([\s\S]*?)Reference Line:\s*"?([\s\S]*?)"?\s*(?=FAQ\s*\d+:|$)/gi;

        let match;
        while ((match = faqRegex.exec(response)) !== null) {
            faqs.push({
                question: match[2].trim(),
                optionA: match[3].trim(),
                optionB: match[4].trim(),
                optionC: match[5].trim(),
                optionD: match[6].trim(),
                correctOption: match[7].trim().toUpperCase(),
                referenceLine: match[9].trim().replace(/^["']|["']$/g, '')
            });
        }
    }

    return faqs;
}

/**
 * Call Google Gemini API
 */
async function callGemini(prompt, apiKey) {
    const candidates = [
        { model: 'gemini-1.5-flash', version: 'v1beta' },
        { model: 'gemini-1.5-pro', version: 'v1beta' },
        { model: 'gemini-1.0-pro', version: 'v1beta' },
        { model: 'gemini-pro', version: 'v1beta' },
        { model: 'gemini-pro', version: 'v1' }
    ];

    let lastError = null;

    console.log('Starting Gemini API calls...');

    for (const candidate of candidates) {
        const url = `https://generativelanguage.googleapis.com/${candidate.version}/models/${candidate.model}:generateContent?key=${apiKey}`;
        console.log(`Trying model: ${candidate.model} (${candidate.version})...`);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates && data.candidates[0] && data.candidates[0].content) {
                console.log(`Success with ${candidate.model}!`);
                return data.candidates[0].content.parts[0].text;
            } else {
                const msg = data.error ? data.error.message : 'Unknown error';
                console.warn(`Failed ${candidate.model}: ${msg}`);
                lastError = msg;
            }
        } catch (error) {
            console.warn(`Error with ${candidate.model}:`, error);
            lastError = error.message;
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt, apiKey) {
    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 4000
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API request failed');
    }

    return data.choices[0].message.content;
}

/**
 * Call Anthropic Claude API
 */
async function callAnthropic(prompt, apiKey) {
    console.log('Calling Anthropic API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || 'Anthropic API request failed');
    }

    return data.content[0].text;
}

/**
 * Generate FAQs using AI
 */
async function generateFAQs() {
    const sourceText = elements.sourceDocument.value.trim();
    const apiKey = elements.apiKey.value.trim() || CONFIG.API_KEY;
    const provider = elements.apiProvider.value || CONFIG.API_PROVIDER;

    if (!sourceText) {
        showToast('Please enter source document text', 'error');
        return;
    }

    if (!apiKey) {
        showToast('Please enter your API key', 'error');
        return;
    }

    setLoading(true);

    try {
        const prompt = getFullPrompt();
        console.log(`Starting FAQ generation with ${provider}...`);

        let response;

        switch (provider) {
            case 'openai':
                response = await callOpenAI(prompt, apiKey);
                break;
            case 'gemini':
                response = await callGemini(prompt, apiKey);
                break;
            case 'anthropic':
                response = await callAnthropic(prompt, apiKey);
                break;
            default:
                throw new Error('Unknown API provider');
        }

        console.log('AI Response received:', response.substring(0, 200) + '...');

        const parsedFaqs = parseAIResponse(response);
        console.log('Parsed FAQs:', parsedFaqs.length);

        if (parsedFaqs.length === 0) {
            throw new Error('Could not parse FAQ response. Please try again.');
        }

        // Clear and add new FAQs
        faqData = [];
        elements.faqCards.innerHTML = '';

        parsedFaqs.slice(0, MAX_FAQS).forEach(faqInfo => {
            addFaq(faqInfo);
        });

        showToast(`Generated ${Math.min(parsedFaqs.length, MAX_FAQS)} FAQs successfully!`);

    } catch (error) {
        console.error('Generation error:', error);
        showToast(error.message || 'Failed to generate FAQs', 'error');
    } finally {
        setLoading(false);
    }
}

async function copyPrompt() {
    const sourceText = elements.sourceDocument.value.trim();

    if (!sourceText) {
        showToast('Please enter source document text first', 'error');
        return;
    }

    const fullPrompt = getFullPrompt();

    try {
        await navigator.clipboard.writeText(fullPrompt);
        showToast('Prompt copied to clipboard!');
    } catch (error) {
        const textArea = document.createElement('textarea');
        textArea.value = fullPrompt;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Prompt copied to clipboard!');
    }
}

// ========================================
// Export Functions
// ========================================

function validateFaqs() {
    const errors = [];

    if (faqData.length !== MAX_FAQS) {
        errors.push(`Exactly ${MAX_FAQS} FAQs are required. Current count: ${faqData.length}`);
    }

    faqData.forEach((faq, index) => {
        const faqNum = index + 1;
        if (!faq.question.trim()) errors.push(`FAQ ${faqNum}: Question is required`);

        const emptyOptions = Object.entries(faq.options)
            .filter(([_, value]) => !value.trim())
            .map(([key]) => key);
        if (emptyOptions.length > 0) errors.push(`FAQ ${faqNum}: Options ${emptyOptions.join(', ')} are empty`);
        if (!faq.correctOption) errors.push(`FAQ ${faqNum}: Correct answer not selected`);
        if (!faq.referenceLine.trim()) errors.push(`FAQ ${faqNum}: Reference line is required`);
    });

    return { isValid: errors.length === 0, errors };
}

function formatFaqsForExport() {
    let output = '';
    faqData.forEach((faq, index) => {
        output += `FAQ ${index + 1}:\n`;
        output += `Question: ${faq.question}\n`;
        output += `A) ${faq.options.A}\n`;
        output += `B) ${faq.options.B}\n`;
        output += `C) ${faq.options.C}\n`;
        output += `D) ${faq.options.D}\n`;
        output += `Correct Answer: ${faq.correctOption}) ${faq.options[faq.correctOption]}\n`;
        output += `Reference Line: "${faq.referenceLine}"\n\n`;
    });
    return output.trim();
}

function formatFaqsForJsonExport() {
    const jsonOutput = {
        faqs: faqData.map(faq => ({
            question: faq.question,
            options: faq.options,
            correct_option: faq.correctOption,
            correct_answer_text: faq.options[faq.correctOption] || '',
            reference_line: faq.referenceLine
        }))
    };
    return JSON.stringify(jsonOutput, null, 2);
}

function exportFaqs(format = 'text') {
    const validation = validateFaqs();
    if (!validation.isValid) {
        showToast(validation.errors[0], 'error');
        return;
    }

    let content, mimeType, filename;
    if (format === 'json') {
        content = formatFaqsForJsonExport();
        mimeType = 'application/json';
        filename = 'generated_faqs.json';
    } else {
        content = formatFaqsForExport();
        mimeType = 'text/plain';
        filename = 'generated_faqs.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`FAQs exported as ${format.toUpperCase()} successfully!`);
}

function clearAll() {
    if (faqData.length === 0 && !elements.sourceDocument.value.trim()) {
        showToast('Nothing to clear', 'error');
        return;
    }

    if (confirm('Are you sure you want to clear all FAQs and the source document?')) {
        faqData = [];
        elements.sourceDocument.value = '';
        elements.charCount.textContent = '0';
        renderAllFaqs();
        updateFaqCounter();
        showToast('All content cleared');
    }
}

// ========================================
// Event Listeners
// ========================================

elements.sourceDocument.addEventListener('input', (e) => {
    elements.charCount.textContent = e.target.value.length.toLocaleString();
});

elements.addFaqBtn.addEventListener('click', () => addFaq());
elements.clearAllBtn.addEventListener('click', clearAll);
elements.exportBtn.addEventListener('click', () => exportFaqs('text'));
elements.exportJsonBtn.addEventListener('click', () => exportFaqs('json'));
elements.copyPromptBtn.addEventListener('click', copyPrompt);
elements.generateBtn.addEventListener('click', generateFAQs);

elements.toggleApiKey.addEventListener('click', () => {
    const input = elements.apiKey;
    input.type = input.type === 'password' ? 'text' : 'password';
});

elements.toggleApiSettings.addEventListener('click', () => {
    elements.apiSettings.classList.toggle('collapsed');
    elements.toggleApiSettings.classList.toggle('collapsed');
});

// ========================================
// Initialization
// ========================================

function init() {
    updateFaqCounter();

    // Pre-fill API key
    if (CONFIG.API_KEY) {
        elements.apiKey.value = CONFIG.API_KEY;
    }

    // Set Gemini as default
    elements.apiProvider.value = 'gemini';

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            generateFAQs();
        }
    });

    console.log('FAQ Generator initialized');
}

init();
