export interface GeminiResponse {
  text: string;
}

export interface CitationStyle {
  type: 'APA' | 'MLA' | 'IEEE';
}

export interface ArticleRequest {
  topic: string;
  length: 'short' | 'medium' | 'long';
  citationStyle: CitationStyle['type'];
  includeReferences: boolean;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ReportOutline {
  title: string;
  sections: string[];
}

export interface GrammarCorrection {
  original: string;
  corrected: string;
  suggestions: string[];
}

export interface MindMapNode {
  id: string;
  text: string;
  children: MindMapNode[];
  level: number;
  shape?: 'circle' | 'square' | 'diamond';
}

export interface TaskPlan {
  title: string;
  description: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface PresentationSlide {
  title: string;
  content: string;
  layout: 'title' | 'text' | 'image-right' | 'image-left';
  imageUrl?: string;
}

export interface WritingSuggestion {
  type: 'completion' | 'grammar' | 'vocabulary';
  suggestion: string;
}

export interface NextSentence {
    sentence: string;
}

class GeminiService {
  private apiKey = 'AIzaSyBsMPe_MEasu7x3u9EK85ULYDHZ3oykklM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  private async makeRequest(prompt: string): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        text: data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to communicate with AI service');
    }
  }

  async generateArticle(request: ArticleRequest): Promise<string> {
    const lengthMap = {
      short: '500-800 وشە',
      medium: '1000-1500 وشە',
      long: '2000-3000 وشە'
    };

    const prompt = `
    ببە بە نووسەرێکی پسپۆڕی ئەکادیمی کە بابەتی زانستی بە زمانی کوردی سۆرانی دەنووسێت.

    بابەت: ${request.topic}
    درێژی: ${lengthMap[request.length]}
    ستایلی سەرچاوە: ${request.citationStyle}
    ${request.includeReferences ? 'زیادکردنی سەرچاوەکان: بەڵێ' : 'زیادکردنی سەرچاوەکان: نەخێر'}

    نووسینەکە دەبێت ئەم پێکهاتەیە هەبێت:
    1. ناونیشان (Title) - ناونیشانێکی گونجاو و ڕوون
    2. پیشەکی (Abstract) - کورتەیەکی 150-250 وشەیی کە بابەتەکە ڕوون دەکاتەوە
    3. چەند بەشێک (Sections) - بەشەکانی سەرەکی بابەتەکە (پێویستە لانی کەم 3 بەش هەبێت)
    4. دەرئەنجام (Conclusion) - کۆتایی هاتنەوە و پێشنیارەکان
    ${request.includeReferences ? '5. سەرچاوەکان (References) - لیستی سەرچاوەکان بە ستایلی ' + request.citationStyle : ''}

    ڕێنماییەکان:
    - زمان: کوردی سۆرانی
    - ستایل: ئەکادیمی و پڕۆفیشناڵ
    - ڕێزمان: ڕاست و ڕوون
    - بابەتەکە دەبێت وەک ئەدەبی ئەکادیمی ڕاستەقینە بێت، نەک وەڵامێکی چات
    - دڵنیابە کە بابەتەکە پێکهاتەی ئەکادیمی هەبێت و زانیاری ڕاستەقینە لەخۆبگرێت
    - هەر بەشێک دەبێت لانی کەم 200 وشە بێت
    - بەکارهێنانی ڕستە و وشەیەکی زانستی
    - بەکارهێنانی هاوکێشەکان بۆ گرێدانی بەشەکان

    تکایە بابەتەکە بە تەواوی بە کوردی سۆرانی بنووسە.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async generateReportOutline(topic: string): Promise<ReportOutline> {
    const prompt = `
    Create a detailed, logical, and well-structured academic report outline for the topic: "${topic}".

    The outline should be tailored to the specific topic, not a generic template. It must include a clear title and a series of relevant sections that flow logically from one to the next.

    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON object.

    JSON Format:
    {
      "title": "A Relevant and Specific Title for the Report",
      "sections": [
        "Introduction",
        "Background and Context",
        "Key Area of Investigation 1",
        "Key Area of Investigation 2",
        "Analysis and Findings",
        "Conclusion",
        "References"
      ]
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to find JSON in AI response.");
    } catch (error) {
      console.error("Failed to parse report outline JSON:", error, "Raw response:", response.text);
      // Fallback to a generic structure if parsing fails, but log the error.
      return {
        title: `Report on: ${topic}`,
        sections: ['Introduction', 'Main Body', 'Conclusion', 'References']
      };
    }
  }

  async generateReportSection(outline: ReportOutline, sectionName: string, previousSections: ReportSection[]): Promise<string> {
    const contextText = previousSections.length > 0 
      ? `بەشە پێشووەکان:\n${previousSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n')}`
      : '';

    const prompt = `
    ڕاپۆرتی تویژینەوە: ${outline.title}
    بەشی ئێستا: ${sectionName}
    
    ${contextText}

    بۆ بەشی "${sectionName}" ناوەڕۆکێکی تەواو و ئەکادیمی بنووسە کە:
    - پەیوەندی بە بەشەکانی دیکەوە هەبێت
    - زانیاری پەیوەست و گرنگ تێدا بێت
    - زمانی ئەکادیمی و ڕوون بەکاربهێنێت
    - بە کوردی سۆرانی نووسرابێت

    درێژی: نزیکەی 300-500 وشە
    
    ناوەڕۆکەکە دەبێت وەک بەشێکی ڕاپۆرتی ڕاستەقینەی تویژینەوە بێت، نەک وەڵامێکی چات. دڵنیابە کە زانیاری ڕاستەقینە و پەیوەندیدار لەخۆدەگرێت.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async checkGrammar(text: string): Promise<GrammarCorrection> {
    const prompt = `
    ببە بە شارەزایەکی زمانی کوردی سۆرانی. ئەم نوسینەی خوارەوە بپشکنە و هەڵەکانی ڕێزمان، ڕێنووس و ستایل ڕاست بکەرەوە:

    "${text}"

    پێداویستییەکان:
    - هەڵەکانی ڕێزمان دیاری بکە و ڕاست بکەرەوە
    - ڕێنووس و خاڵبەندی باشتر بکە
    - وشەسازی گونجاوتر پێشنیار بکە
    - ڕستەکان ڕوونتر و خوێندراوتر بکە

    وەڵامەکە بە JSON فۆرماتی خوارەوە بدەرەوە:
    {
      "original": "نووسینی سەرەتایی",
      "corrected": "نووسینی ڕاستکراوە",
      "suggestions": ["پێشنیار 1", "پێشنیار 2", ...]
    }
    
    وەڵامەکە دەبێت تەنها چاککردنەوەی ڕێزمان بێت، نەک دەقێکی نوێ. دڵنیابە کە هەڵەکان بە دیارییەوە دیاری بکەیت و ڕاست بکەیتەوە.
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response.text);
    } catch {
      return {
        original: text,
        corrected: text,
        suggestions: ['هیچ گۆڕانکارییەک پێویست نییە']
      };
    }
  }

  async generateMindMap(topic: string): Promise<MindMapNode> {
    const prompt = `
    Generate a mind map for the topic "${topic}" in Sorani Kurdish. The mind map should explore related concepts.

    Structure:
    - A central root node: The main topic.
    - Main branches: 4-6 key concepts related to the main topic.
    - Sub-branches: 2-4 details for each main branch.

    For example, if the topic is "Kurdish Culture", the root node would be "Kurdish Culture", main branches could be "History", "Traditions", "Language", etc., and sub-branches would be details about each.

    IMPORTANT: Respond ONLY with a valid JSON object that follows the structure below. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON object.

    JSON Format:
    {
      "id": "root",
      "text": "The Main Topic",
      "level": 0,
      "children": [
        {
          "id": "1",
          "text": "First Branch",
          "level": 1,
          "children": [
            {"id": "1.1", "text": "Sub-branch detail", "level": 2, "children": []},
            {"id": "1.2", "text": "Another detail", "level": 2, "children": []}
          ]
        },
        {
          "id": "2",
          "text": "Second Branch",
          "level": 1,
          "children": [
            {"id": "2.1", "text": "Detail for second branch", "level": 2, "children": []}
          ]
        }
      ]
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      // The response might be wrapped in markdown, so let's try to extract it.
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        // Basic validation
        if (parsedResponse && parsedResponse.id && parsedResponse.text && Array.isArray(parsedResponse.children)) {
            return parsedResponse;
        }
      }
      throw new Error('Invalid or non-JSON response from AI.');
    } catch (e) {
      console.error("Failed to parse mind map JSON:", e);
      console.error("Raw AI response:", response.text);
      // Return a structure that indicates an error, but is still a valid MindMapNode
      return {
        id: 'root',
        text: 'Error Generating Mind Map',
        level: 0,
        children: [
            { id: 'error-1', text: 'Could not generate mind map from AI.', level: 1, children: [] },
            { id: 'error-2', text: 'Please try a different topic.', level: 1, children: [] }
        ]
      };
    }
  }

  async summarizeText(text: string, length: 'short' | 'medium' | 'detailed'): Promise<string> {
    const lengthMap = {
      short: '2-3 ڕستە',
      medium: '1 پەرەگراف',
      detailed: '2-3 پەرەگراف'
    };

    const prompt = `
    ئەم نووسینەی خوارەوە بە کوردی سۆرانی کورت بکەرەوە:

    "${text}"

    درێژی کورتکردنەوە: ${lengthMap[length]}
    
    پێداویستییەکان:
    - گرنگترین خاڵەکان بپارێزە
    - زمانی ڕوون و گونجاو بەکاربهێنە
    - واتای سەرەکی لەدەست نەدە
    - بە کوردی سۆرانی بنووسە
    
    کورتکردنەوەکە دەبێت وەک ڕاپۆرتێکی کورت بێت، نەک وەڵامێکی چات. دڵنیابە کە زانیاری گرنگەکان لەخۆدەگرێت.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async paraphraseText(text: string): Promise<string> {
    const prompt = `
    ئەم نووسینەی خوارەوە بە شێوەیەکی جیاواز و بە واتایەکی هەمان بنووسەرەوە:

    "${text}"

    پێداویستییەکان:
    - واتای سەرەکی هەمان بمێنێتەوە
    - وشە و ڕستەکان بگۆڕە
    - ستایلی نووسین جیاواز بکە
    - زمانی کوردی سۆرانی بەکاربهێنە
    
    نووسینەوەکە دەبێت وەک دەقێکی ئەکادیمی دووبارە بێت، نەک وەڵامێکی چات. دڵنیابە کە واتاکە هەمان بمێنێتەوە بەڵام بە شێوەیەکی جیاواز.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async generateTaskPlan(projectTitle: string, deadline: string, details: string): Promise<TaskPlan[]> {
    const prompt = `
    بۆ پڕۆژەی "${projectTitle}" کە دەبێت لە "${deadline}" تەواو بێت، پلانێکی ورد دروست بکە.

    وردەکارییەکان: ${details}

    پلانەکە دەبێت:
    - ئەرکەکان بە ڕێکخستنی کاتی دابەش بکات
    - گرنگی هەر ئەرکێک دیاری بکات
    - کاتی ڕەنگبەرەنگ بۆ تەواوکردن تەرخان بکات

    وەڵامەکە بە JSON فۆرماتی خوارەوە بدەرەوە:
    [
      {
        "title": "ناونیشانی ئەرک",
        "description": "وەسفی ئەرک",
        "deadline": "YYYY-MM-DD",
        "priority": "high/medium/low",
        "status": "pending"
      }
    ]
    
    پلانەکە دەبێت بۆ پڕۆژەی ڕاستەقینەی ئەکادیمی بێت، نەک وەڵامێکی چات. دڵنیابە کە ئەرکەکان ڕاستەقینە و پەیوەندیدار بن.
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response.text);
    } catch {
      return [];
    }
  }

  async generateFlashcards(text: string): Promise<Flashcard[]> {
    const prompt = `
    Based on the following text, generate a set of flashcards. Each flashcard should have a "question" and a concise "answer".

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON array.

    JSON Format:
    [
      {
        "question": "What is the capital of Iraq?",
        "answer": "Baghdad"
      },
      {
        "question": "What is the main river in Iraq?",
        "answer": "The Tigris"
      }
    ]
    `;

    const response = await this.makeRequest(prompt);
    try {
      // Clean the response by removing markdown and extracting the JSON array
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      console.error("Failed to find JSON in AI response:", response.text);
      return [];
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error, "Raw response:", response.text);
      return [];
    }
  }

  async generateQuiz(text: string): Promise<QuizQuestion[]> {
    const prompt = `
    Based on the following text, generate a multiple-choice quiz. Each question should have four options and one correct answer.

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON array.

    JSON Format:
    [
      {
        "question": "Which of these is a primary color?",
        "options": ["Green", "Orange", "Blue", "Purple"],
        "correctAnswer": "Blue"
      },
      {
        "question": "What is 2 + 2?",
        "options": ["3", "4", "5", "6"],
        "correctAnswer": "4"
      }
    ]
    `;

    const response = await this.makeRequest(prompt);
    try {
      // Clean the response by removing markdown and extracting the JSON array
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      console.error("Failed to find JSON in AI response:", response.text);
      return [];
    } catch (error) {
      console.error("Failed to parse quiz JSON:", error, "Raw response:", response.text);
      return [];
    }
  }

  async generatePresentation(text: string): Promise<PresentationSlide[]> {
    const prompt = `
    Based on the following text, generate a presentation with multiple slides. Each slide should have a title, content, and a suggested layout from the following options: 'title', 'text', 'image-right', 'image-left'. For image layouts, provide a relevant placeholder image URL from picsum.photos.

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON array of objects. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON array.

    JSON Format:
    [
      {
        "title": "Presentation Title",
        "content": "A brief introduction to the topic.",
        "layout": "title"
      },
      {
        "title": "Key Point 1",
        "content": "Detailed explanation of the first key point.",
        "layout": "text"
      },
      {
        "title": "Visual for Key Point 2",
        "content": "Content related to the image.",
        "layout": "image-right",
        "imageUrl": "https://picsum.photos/800/600"
      }
    ]
    `;

    const response = await this.makeRequest(prompt);
    try {
      const jsonMatch = response.text.match(/(\[[\s\S]*\])/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      return [];
    } catch (error) {
      console.error("Failed to parse presentation JSON:", error, "Raw response:", response.text);
      return [];
    }
  }

  async getWritingSuggestion(text: string): Promise<WritingSuggestion> {
    const prompt = `
    You are an AI writing supervisor. Analyze the following text and provide a suggestion to improve it. The suggestion can be a sentence completion, a grammar correction, or a vocabulary enhancement.

    Text: "${text}"

    IMPORTANT: Respond ONLY with a valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json. The entire response must be a single JSON object.

    JSON Format:
    {
      "type": "completion" | "grammar" | "vocabulary",
      "suggestion": "The suggested text."
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to find JSON in AI response.");
    } catch (error) {
      console.error("Failed to parse writing suggestion JSON:", error, "Raw response:", response.text);
      throw error;
    }
  }

  async generateNextSentence(topic: string, currentText: string): Promise<NextSentence> {
    const prompt = `
    You are an AI writing partner. Your task is to write the very next sentence of the text provided, based on the overall topic.

    Topic: "${topic}"

    Current Text:
    "${currentText}"

    Instructions:
    - Write only one single, coherent sentence that logically follows the current text.
    - Maintain a consistent tone and style.
    - Do not repeat information.
    - Do not add any extra text, explanations, or labels.

    IMPORTANT: Respond ONLY with a valid JSON object containing the next sentence.

    JSON Format:
    {
      "sentence": "The single, complete next sentence."
    }
    `;

    const response = await this.makeRequest(prompt);
    try {
      const cleanedText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanedText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to find JSON in AI response.");
    } catch (error) {
      console.error("Failed to parse next sentence JSON:", error, "Raw response:", response.text);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();