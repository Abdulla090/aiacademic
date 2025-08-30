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
  language: string;
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
  imageSearchTerm?: string;
}

export interface WritingSuggestion {
  type: 'completion' | 'grammar' | 'vocabulary';
  suggestion: string;
}

export interface NextSentence {
    sentence: string;
}

export interface CitationRequest {
  content: string; // The text content from the file or website
  style: 'APA' | 'MLA' | 'Chicago' | 'IEEE';
}

class GeminiService {
  private apiKey = 'AIzaSyBsMPe_MEasu7x3u9EK85ULYDHZ3oykklM';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

  private async makeRequest(prompt: string, model = 'gemini-2.0-flash-exp'): Promise<GeminiResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    try {
      const response = await fetch(`${url}?key=${this.apiKey}`, {
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
      short: '500-800 words',
      medium: '1000-1500 words',
      long: '2000-3000 words'
    };

    const prompt = `
    Become an expert academic writer who writes scientific articles in ${request.language === 'ku' ? 'Sorani Kurdish' : request.language}.

    Topic: ${request.topic}
    Length: ${lengthMap[request.length]}
    Citation Style: ${request.citationStyle}
    ${request.includeReferences ? 'Add References: Yes' : 'Add References: No'}
    Language: ${request.language}

    The article must have the following structure:
    1. Title - A suitable and clear title
    2. Abstract - A 150-250 word summary that explains the topic
    3. Sections - The main sections of the article (must have at least 3 sections)
    4. Conclusion - Conclusion and recommendations
    ${request.includeReferences ? '5. References - List of references in ' + request.citationStyle + ' style' : ''}

    Instructions:
    - Language: ${request.language}
    - Style: Academic and professional
    - Grammar: Correct and clear
    - The article should be like a real academic paper, not a chat response
    - Make sure the article has an academic structure and contains real information
    - Each section should be at least 200 words
    - Use scientific sentences and words
    - Use conjunctions to connect the sections

    Please write the article entirely in ${request.language}.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async generateReportOutline(topic: string, language: string): Promise<ReportOutline> {
    const prompt = `
    Create a detailed, logical, and well-structured academic report outline for the topic: "${topic}".

    The outline should be in ${language === 'ku' ? 'Sorani Kurdish' : language}. It must include a clear title and a series of relevant sections that flow logically from one to the next.

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

  async generateReportSection(outline: ReportOutline, sectionName: string, previousSections: ReportSection[], language: string): Promise<string> {
    const contextText = previousSections.length > 0 
      ? `Previous sections:\n${previousSections.map(s => `${s.title}: ${s.content.substring(0, 200)}...`).join('\n')}`
      : '';

    const prompt = `
    Academic Report: ${outline.title}
    Current Section: ${sectionName}
    
    ${contextText}

    For the section "${sectionName}", write a complete and academic content that has the style of an academic report, not a research paper. The content should be an analysis and summary of information on the topic.

    The content must:
    - Be clear and organized.
    - Contain accurate and correct information.
    - Use academic and formal language.
    - Be written in ${language === 'ku' ? 'Sorani Kurdish' : language}.
    - Be related to the other sections of the report.

    Length: Approximately 300-500 words.
    
    Please write the content as part of an academic report, not as a chat response. Focus on analyzing and presenting information, not on presenting hypotheses and new research methodologies.
    `;

    const response = await this.makeRequest(prompt);
    if (typeof response.text === 'string') {
      return response.text;
    }
    // If the response is not a string, return an empty string and log an error.
    console.error("AI response for section was not a string:", response);
    return "";
  }

  async checkGrammar(text: string, language: string): Promise<GrammarCorrection> {
    const prompt = `
    Become an expert in ${language === 'ku' ? 'Sorani Kurdish' : language} grammar. Check the following text and correct any grammar, spelling, and style mistakes:

    "${text}"

    Requirements:
    - Identify and correct grammar mistakes
    - Improve spelling and punctuation
    - Suggest better vocabulary
    - Make sentences clearer and more readable
    - Use conjunctions to connect sentences
    - Ensure the text is in a formal, academic style

    Provide the response in the following JSON format:
    {
      "original": "The original text",
      "corrected": "The corrected text",
      "suggestions": [
        "Suggestion 1: Details about a specific mistake",
        "Suggestion 2: Details about another mistake"
      ]
    }
    
    The response should only be a grammar correction, not a new text. Be sure to identify and correct the mistakes specifically.
    `;

    const response = await this.makeRequest(prompt);
    try {
      return JSON.parse(response.text);
    } catch {
      return {
        original: text,
        corrected: text,
        suggestions: ['No changes needed']
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
      short: '2-3 sentences',
      medium: '1 paragraph',
      detailed: '2-3 paragraphs'
    };

    const prompt = `
    Summarize the following text in Sorani Kurdish:

    "${text}"

    Summary length: ${lengthMap[length]}
    
    Requirements:
    - Preserve the most important points
    - Use clear and concise language
    - Do not lose the main meaning
    - Write in Sorani Kurdish
    
    The summary should be like a short report, not a chat response. Make sure it contains the important information.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async paraphraseText(text: string): Promise<string> {
    const prompt = `
    Rewrite the following text in a different way, but with the same meaning:

    "${text}"

    Requirements:
    - The main meaning should remain the same
    - Change the words and sentences
    - Use a different writing style
    - Use Sorani Kurdish
    
    The rewritten text should be like a rewritten academic text, not a chat response. Make sure the meaning remains the same, but in a different way.
    `;

    const response = await this.makeRequest(prompt);
    return response.text;
  }

  async generateTaskPlan(projectTitle: string, deadline: string, details: string): Promise<TaskPlan[]> {
    const prompt = `
    For the project "${projectTitle}" which must be completed by "${deadline}", create a detailed plan.

    Details: ${details}

    The plan must:
    - Divide the tasks chronologically
    - Specify the importance of each task
    - Allocate a reasonable time for completion

    Provide the response in the following JSON format:
    [
      {
        "title": "Task Title",
        "description": "Task Description",
        "deadline": "YYYY-MM-DD",
        "priority": "high/medium/low",
        "status": "pending"
      }
    ]
    
    The plan should be for a real academic project, not a chat response. Make sure the tasks are realistic and relevant.
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

  async generatePresentation(
    text: string,
    slideCount: number,
    style: string,
    core: string
  ): Promise<PresentationSlide[]> {
    const prompt = `
    As an expert presentation designer, create a visually stunning and professional presentation based on the following text.

    Text: "${text}"
    Number of Slides: ${slideCount}
    Presentation Style: ${style}
    Core Focus: ${core}

    Instructions:
    - Generate a complete presentation with a title slide, content slides, and a concluding slide.
    - For each slide, provide a title, content, and a layout ('title', 'text', 'image-right', 'image-left').
    - The design should be clean, modern, and professional. Use strong typography and a clear hierarchy.
    - For slides with images, provide a relevant and concise "imageSearchTerm" (e.g., "data analysis", "team collaboration"). Do NOT provide a full URL.
    - Ensure the content is well-structured, concise, and easy to understand.

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
        "imageSearchTerm": "business meeting"
      }
    ]
    `;

    const response = await this.makeRequest(prompt, 'gemini-2.5-flash');
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

  async generateCitation(request: CitationRequest): Promise<string> {
    const prompt = `
    You are an expert academic librarian skilled in generating citations in various styles.
    Generate a citation for the following content in ${request.style} style.
    
    Content:
    "${request.content}"
    
    Instructions:
    - Provide only the citation text.
    - Do not include any explanations or extra text.
    - Ensure the citation is correctly formatted according to ${request.style} guidelines.
    - If the content is insufficient to create a full citation, do your best with the available information.
    `;

    const response = await this.makeRequest(prompt);
    return response.text.trim();
  }

  async chatWithFile(fileContent: string, message: string): Promise<string> {
    const prompt = `
    You are an intelligent assistant that can answer questions based on the provided file content.
    The user has uploaded a file and is asking a question about it.

    File Content:
    """
    ${fileContent}
    """

    User's Question: "${message}"

    Instructions:
    - Answer the user's question based *only* on the information in the file content.
    - If the answer is in the file, provide the answer and a reference to the page or section where the information can be found (if possible).
    - If the answer is not in the file, say that you cannot find the answer in the provided document.
    - Be concise and clear in your response.
    `;

    const response = await this.makeRequest(prompt);
    return response.text.trim();
  }
}

export const geminiService = new GeminiService();