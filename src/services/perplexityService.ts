/**
 * Perplexity AI Service
 * Provides academic research capabilities using Perplexity's Sonar API
 */

// Types matching AIResearchAssistant component
interface Source {
  id: string;
  title: string;
  url: string;
  credibilityScore: number;
  type: 'academic' | 'news' | 'government' | 'organization' | 'other';
  publishDate?: string;
  author?: string;
}

interface Citation {
  id: string;
  format: 'APA' | 'MLA' | 'Chicago';
  citation: string;
}

interface ResearchResult {
  id: string;
  title: string;
  summary: string;
  sources: Source[];
  credibilityScore: number;
  keyFindings: string[];
  relatedTopics: string[];
  citations: Citation[];
}

// Perplexity API response types
interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityChoice {
  index: number;
  message: PerplexityMessage;
  finish_reason: string;
}

interface PerplexitySearchResult {
  title?: string;
  url?: string;
  snippet?: string;
}

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: PerplexityChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  search_results?: PerplexitySearchResult[];
}

class PerplexityService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
    this.baseUrl = import.meta.env.VITE_PERPLEXITY_API_URL || 'https://api.perplexity.ai';
    
    if (!this.apiKey) {
      throw new Error('Perplexity API key not found. Please set VITE_PERPLEXITY_API_KEY in your environment variables.');
    }
  }

  /**
   * Makes a request to Perplexity API
   */
  private async makeRequest(
    messages: PerplexityMessage[],
    searchMode: 'academic' | 'web' = 'academic'
  ): Promise<PerplexityResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages,
        search_mode: searchMode,
        temperature: 0.2,
        max_tokens: 4000,
        return_related_questions: true,
        search_recency_filter: 'year' // Focus on recent academic publications
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Conducts academic research using Perplexity API
   * @param query The research query
   * @returns Structured research result
   */
  async researchQuery(query: string): Promise<ResearchResult> {
    try {
      // First request: Get comprehensive research with sources
      const researchPrompt = `
You are an expert academic research assistant. Conduct comprehensive scholarly research on the following query: "${query}"

Provide a detailed academic response in JSON format with this EXACT structure:
{
  "title": "A concise academic title for this research",
  "summary": "A comprehensive 3-4 paragraph academic summary covering: background, current state, key research findings, and implications. Use scholarly language and cite key points.",
  "credibilityScore": "A score from 0-100 based on the quality and reliability of academic sources (90-100: peer-reviewed journals, 80-89: reputable institutions, 70-79: credible organizations, below 70: general sources)",
  "keyFindings": [
    "Specific, evidence-based finding 1 with quantitative data when possible",
    "Specific, evidence-based finding 2 with quantitative data when possible",
    "Specific, evidence-based finding 3 with quantitative data when possible",
    "Specific, evidence-based finding 4 with quantitative data when possible",
    "Specific, evidence-based finding 5 with quantitative data when possible"
  ],
  "relatedTopics": [
    "Related academic topic or subtopic 1",
    "Related academic topic or subtopic 2",
    "Related academic topic or subtopic 3",
    "Related academic topic or subtopic 4",
    "Related academic topic or subtopic 5"
  ],
  "sources": [
    {
      "title": "Full title of academic paper, journal article, or institutional report",
      "author": "Author name(s) or Institution name",
      "type": "academic|government|organization",
      "credibilityScore": 85,
      "publishDate": "2024-01-15",
      "url": "https://example.com/source1"
    }
  ],
  "citations": [
    {
      "format": "APA",
      "citation": "Proper APA 7th edition formatted citation"
    },
    {
      "format": "MLA",
      "citation": "Proper MLA 9th edition formatted citation"
    },
    {
      "format": "Chicago",
      "citation": "Proper Chicago 17th edition formatted citation"
    }
  ]
}

IMPORTANT REQUIREMENTS:
1. Use ONLY academic, peer-reviewed, government, or reputable institutional sources
2. Provide specific, quantitative findings with numbers/percentages when available
3. Include 5-8 high-quality sources from the search results
4. Format citations according to standard academic style guides
5. If query is in Kurdish, respond in Kurdish; if in English, respond in English
6. Ensure all key findings are evidence-based and properly sourced
7. Maintain scholarly objectivity and avoid bias
8. Focus on recent research (last 1-3 years when possible)

Return ONLY the JSON object, no additional text.`;

      const messages: PerplexityMessage[] = [
        {
          role: 'system',
          content: 'You are an expert academic research assistant specializing in scholarly research, citation, and evidence-based analysis. You provide comprehensive, well-sourced academic information.'
        },
        {
          role: 'user',
          content: researchPrompt
        }
      ];

      const response = await this.makeRequest(messages, 'academic');

      // Extract the response content
      const content = response.choices[0]?.message?.content || '';

      // Try to parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const researchData = JSON.parse(jsonMatch[0]);

          // Enhance sources with search results from Perplexity
          const enhancedSources: Source[] = [];
          
          // Add sources from AI response
          if (researchData.sources && Array.isArray(researchData.sources)) {
            researchData.sources.forEach((source: unknown, index: number) => {
              const s = source as Record<string, unknown>;
              enhancedSources.push({
                id: (index + 1).toString(),
                title: String(s.title || 'Unknown Source'),
                author: String(s.author || 'Unknown Author'),
                type: this.validateSourceType(String(s.type || 'other')),
                credibilityScore: this.validateCredibilityScore(Number(s.credibilityScore) || 75),
                publishDate: String(s.publishDate || new Date().toISOString().split('T')[0]),
                url: String(s.url || '#')
              });
            });
          }

          // Add Perplexity's search results as additional sources
          if (response.search_results && Array.isArray(response.search_results)) {
            response.search_results.slice(0, 5).forEach((result, index) => {
              if (result.url && result.title) {
                enhancedSources.push({
                  id: (enhancedSources.length + 1).toString(),
                  title: result.title,
                  author: this.extractDomainName(result.url),
                  type: this.inferSourceType(result.url),
                  credibilityScore: this.calculateSourceCredibility(result.url),
                  publishDate: new Date().toISOString().split('T')[0],
                  url: result.url
                });
              }
            });
          }

          // Build the final result
          const result: ResearchResult = {
            id: Date.now().toString(),
            title: researchData.title || this.generateTitle(query),
            summary: researchData.summary || content.slice(0, 800),
            credibilityScore: this.validateCredibilityScore(researchData.credibilityScore || 85),
            keyFindings: Array.isArray(researchData.keyFindings) 
              ? researchData.keyFindings.slice(0, 6)
              : this.extractKeyFindings(content),
            relatedTopics: Array.isArray(researchData.relatedTopics)
              ? researchData.relatedTopics.slice(0, 6)
              : this.generateRelatedTopics(query),
            sources: enhancedSources.slice(0, 10), // Limit to 10 sources
            citations: this.formatCitations(researchData.citations || [], researchData.title, query)
          };

          return result;
        }
      } catch (parseError) {
        console.warn('Could not parse JSON response, using fallback structure', parseError);
      }

      // Fallback if JSON parsing fails - extract information from text
      return this.createFallbackResult(query, content, response.search_results || []);

    } catch (error) {
      console.error('Perplexity Research Query Error:', error);
      throw new Error(`Unable to complete research query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Helper: Validate source type
   */
  private validateSourceType(type: string): 'academic' | 'news' | 'government' | 'organization' | 'other' {
    const validTypes: Array<'academic' | 'news' | 'government' | 'organization' | 'other'> = 
      ['academic', 'news', 'government', 'organization', 'other'];
    return validTypes.includes(type as any) ? type as any : 'other';
  }

  /**
   * Helper: Validate credibility score
   */
  private validateCredibilityScore(score: number): number {
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Helper: Infer source type from URL
   */
  private inferSourceType(url: string): 'academic' | 'news' | 'government' | 'organization' | 'other' {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.edu') || lowerUrl.includes('scholar') || 
        lowerUrl.includes('journal') || lowerUrl.includes('academic') ||
        lowerUrl.includes('research') || lowerUrl.includes('nature.com') ||
        lowerUrl.includes('science.org') || lowerUrl.includes('springer') ||
        lowerUrl.includes('wiley') || lowerUrl.includes('elsevier')) {
      return 'academic';
    }
    
    if (lowerUrl.includes('.gov') || lowerUrl.includes('government')) {
      return 'government';
    }
    
    if (lowerUrl.includes('news') || lowerUrl.includes('times') || 
        lowerUrl.includes('post') || lowerUrl.includes('reuters') ||
        lowerUrl.includes('bbc') || lowerUrl.includes('cnn')) {
      return 'news';
    }
    
    if (lowerUrl.includes('.org') || lowerUrl.includes('who.int') ||
        lowerUrl.includes('unesco') || lowerUrl.includes('worldbank')) {
      return 'organization';
    }
    
    return 'other';
  }

  /**
   * Helper: Calculate source credibility based on URL
   */
  private calculateSourceCredibility(url: string): number {
    const lowerUrl = url.toLowerCase();
    
    // Peer-reviewed journals and top universities
    if (lowerUrl.includes('nature.com') || lowerUrl.includes('science.org') ||
        lowerUrl.includes('pnas.org') || lowerUrl.includes('lancet.com') ||
        lowerUrl.includes('nejm.org') || lowerUrl.includes('cell.com')) {
      return 98;
    }
    
    // Academic institutions
    if (lowerUrl.includes('.edu') || lowerUrl.includes('scholar.google')) {
      return 92;
    }
    
    // Government sources
    if (lowerUrl.includes('.gov')) {
      return 90;
    }
    
    // International organizations
    if (lowerUrl.includes('who.int') || lowerUrl.includes('unesco') ||
        lowerUrl.includes('worldbank') || lowerUrl.includes('un.org')) {
      return 88;
    }
    
    // General academic publishers
    if (lowerUrl.includes('springer') || lowerUrl.includes('wiley') ||
        lowerUrl.includes('elsevier') || lowerUrl.includes('sage')) {
      return 85;
    }
    
    // Reputable news outlets
    if (lowerUrl.includes('reuters') || lowerUrl.includes('bbc') ||
        lowerUrl.includes('economist')) {
      return 80;
    }
    
    // Default
    return 70;
  }

  /**
   * Helper: Extract domain name from URL
   */
  private extractDomainName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Unknown Source';
    }
  }

  /**
   * Helper: Generate a title from query
   */
  private generateTitle(query: string): string {
    const words = query.split(' ');
    if (words.length <= 8) {
      return query.charAt(0).toUpperCase() + query.slice(1);
    }
    return words.slice(0, 8).join(' ') + '...';
  }

  /**
   * Helper: Extract key findings from text
   */
  private extractKeyFindings(text: string): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  /**
   * Helper: Generate related topics
   */
  private generateRelatedTopics(query: string): string[] {
    return [
      `${query} - recent developments`,
      `${query} - research methods`,
      `${query} - future implications`,
      `${query} - case studies`,
      `${query} - theoretical frameworks`
    ];
  }

  /**
   * Helper: Format citations
   */
  private formatCitations(citations: unknown[], title: string, query: string): Citation[] {
    const currentYear = new Date().getFullYear();
    const formatted: Citation[] = [];

    // Use provided citations if available
    if (Array.isArray(citations) && citations.length > 0) {
      citations.forEach((citation: unknown, index: number) => {
        const c = citation as Record<string, unknown>;
        formatted.push({
          id: (index + 1).toString(),
          format: String(c.format || 'APA') as 'APA' | 'MLA' | 'Chicago',
          citation: String(c.citation || '')
        });
      });
    }

    // Ensure we have all three formats
    const formats: Array<'APA' | 'MLA' | 'Chicago'> = ['APA', 'MLA', 'Chicago'];
    formats.forEach((format, index) => {
      if (!formatted.find(c => c.format === format)) {
        let citation = '';
        if (format === 'APA') {
          citation = `Perplexity AI Research. (${currentYear}). ${title}. AI Academic Hub Research Assistant.`;
        } else if (format === 'MLA') {
          citation = `"${title}." Perplexity AI Research, ${currentYear}, AI Academic Hub.`;
        } else {
          citation = `Perplexity AI Research. "${title}." AI Academic Hub, ${currentYear}.`;
        }
        formatted.push({
          id: (formatted.length + 1).toString(),
          format,
          citation
        });
      }
    });

    return formatted.slice(0, 3);
  }

  /**
   * Helper: Create fallback result structure
   */
  private createFallbackResult(
    query: string,
    content: string,
    searchResults: PerplexitySearchResult[]
  ): ResearchResult {
    const sources: Source[] = searchResults
      .filter(r => r.url && r.title)
      .slice(0, 8)
      .map((result, index) => ({
        id: (index + 1).toString(),
        title: result.title || 'Research Source',
        author: this.extractDomainName(result.url!),
        type: this.inferSourceType(result.url!),
        credibilityScore: this.calculateSourceCredibility(result.url!),
        publishDate: new Date().toISOString().split('T')[0],
        url: result.url || '#'
      }));

    return {
      id: Date.now().toString(),
      title: this.generateTitle(query),
      summary: content.slice(0, 800),
      credibilityScore: sources.length > 0 ? 82 : 70,
      keyFindings: this.extractKeyFindings(content),
      relatedTopics: this.generateRelatedTopics(query),
      sources,
      citations: this.formatCitations([], this.generateTitle(query), query)
    };
  }
}

// Export singleton instance
export const perplexityService = new PerplexityService();

// Export research function for direct use (compatible with geminiService)
export const researchQuery = (query: string) => perplexityService.researchQuery(query);
