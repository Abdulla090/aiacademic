import { appConfig, socialConfig } from '../config/env';

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
}

export class SEOManager {
  private static instance: SEOManager;
  private defaultData: SEOData;

  private constructor() {
    this.defaultData = {
      title: appConfig.title,
      description: appConfig.description,
      keywords: ['Kurdish', 'Academic', 'AI', 'Education', 'Research', 'Writing'],
      image: `${appConfig.url}/favicon.ico`,
      url: appConfig.url,
      type: 'website',
      locale: 'ku_IQ',
    };
  }

  public static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  public updateSEO(data: SEOData): void {
    const seoData = { ...this.defaultData, ...data };
    
    // Update title
    if (seoData.title) {
      document.title = seoData.title;
      this.updateMetaTag('property', 'og:title', seoData.title);
      this.updateMetaTag('name', 'twitter:title', seoData.title);
    }

    // Update description
    if (seoData.description) {
      this.updateMetaTag('name', 'description', seoData.description);
      this.updateMetaTag('property', 'og:description', seoData.description);
      this.updateMetaTag('name', 'twitter:description', seoData.description);
    }

    // Update keywords
    if (seoData.keywords && seoData.keywords.length > 0) {
      this.updateMetaTag('name', 'keywords', seoData.keywords.join(', '));
    }

    // Update URL
    if (seoData.url) {
      this.updateMetaTag('property', 'og:url', seoData.url);
      this.updateLinkTag('canonical', seoData.url);
    }

    // Update image
    if (seoData.image) {
      this.updateMetaTag('property', 'og:image', seoData.image);
      this.updateMetaTag('name', 'twitter:image', seoData.image);
    }

    // Update type
    if (seoData.type) {
      this.updateMetaTag('property', 'og:type', seoData.type);
      this.updateMetaTag('name', 'twitter:card', seoData.type === 'article' ? 'summary_large_image' : 'summary');
    }

    // Update locale
    if (seoData.locale) {
      this.updateMetaTag('property', 'og:locale', seoData.locale);
    }

    // Update author
    if (seoData.author) {
      this.updateMetaTag('name', 'author', seoData.author);
      this.updateMetaTag('property', 'article:author', seoData.author);
    }

    // Update article times
    if (seoData.publishedTime) {
      this.updateMetaTag('property', 'article:published_time', seoData.publishedTime);
    }

    if (seoData.modifiedTime) {
      this.updateMetaTag('property', 'article:modified_time', seoData.modifiedTime);
    }

    // Update article section
    if (seoData.section) {
      this.updateMetaTag('property', 'article:section', seoData.section);
    }

    // Update article tags
    if (seoData.tags && seoData.tags.length > 0) {
      // Remove existing article:tag meta tags
      this.removeMetaTags('property', 'article:tag');
      
      // Add new article:tag meta tags
      seoData.tags.forEach(tag => {
        this.addMetaTag('property', 'article:tag', tag);
      });
    }

    // Update social media specific tags
    this.updateSocialTags();
  }

  private updateMetaTag(attribute: string, name: string, content: string): void {
    let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  }

  private addMetaTag(attribute: string, name: string, content: string): void {
    const element = document.createElement('meta');
    element.setAttribute(attribute, name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }

  private removeMetaTags(attribute: string, name: string): void {
    const elements = document.querySelectorAll(`meta[${attribute}="${name}"]`);
    elements.forEach(element => element.remove());
  }

  private updateLinkTag(rel: string, href: string): void {
    let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    
    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }
    
    element.setAttribute('href', href);
  }

  private updateSocialTags(): void {
    // Twitter
    if (socialConfig.twitter) {
      this.updateMetaTag('name', 'twitter:site', `@${socialConfig.twitter}`);
      this.updateMetaTag('name', 'twitter:creator', `@${socialConfig.twitter}`);
    }

    // Facebook App ID (if you have one)
    // this.updateMetaTag('property', 'fb:app_id', 'YOUR_FACEBOOK_APP_ID');
  }

  public setPageSEO(page: string, customData?: Partial<SEOData>): void {
    const pageSEOData = this.getPageSEOData(page);
    const finalData = { ...pageSEOData, ...customData };
    this.updateSEO(finalData);
  }

  private getPageSEOData(page: string): SEOData {
    const pageData: Record<string, SEOData> = {
      '/': {
        title: `${appConfig.title} - Kurdish Academic Platform`,
        description: 'AI-powered Kurdish academic platform for writing, research, and learning.',
        keywords: ['Kurdish academic platform', 'AI writing', 'Kurdish language', 'Academic tools'],
        type: 'website',
      },
      '/dashboard': {
        title: `Dashboard - ${appConfig.title}`,
        description: 'Access all AI-powered academic tools in one place.',
        keywords: ['academic dashboard', 'AI tools', 'Kurdish education'],
      },
      '/article-writer': {
        title: `AI Article Writer - ${appConfig.title}`,
        description: 'Generate high-quality academic articles with AI assistance in Kurdish and English.',
        keywords: ['AI article writer', 'academic writing', 'Kurdish articles', 'AI writing assistant'],
        section: 'Writing Tools',
      },
      '/grammar-checker': {
        title: `Grammar Checker - ${appConfig.title}`,
        description: 'Check and fix grammar in Kurdish and English texts with advanced AI.',
        keywords: ['grammar checker', 'Kurdish grammar', 'text correction', 'language tools'],
        section: 'Language Tools',
      },
      '/flashcard-generator': {
        title: `Flashcard Generator - ${appConfig.title}`,
        description: 'Create interactive flashcards for effective learning and memorization.',
        keywords: ['flashcards', 'study tools', 'memorization', 'learning aids'],
        section: 'Study Tools',
      },
      '/quiz-generator': {
        title: `Quiz Generator - ${appConfig.title}`,
        description: 'Generate quizzes and assessments from any content automatically.',
        keywords: ['quiz generator', 'assessment tools', 'educational quizzes', 'learning evaluation'],
        section: 'Assessment Tools',
      },
      '/presentation-generator': {
        title: `Presentation Generator - ${appConfig.title}`,
        description: 'Create professional presentations from text content automatically.',
        keywords: ['presentation generator', 'slides creator', 'academic presentations', 'AI presentations'],
        section: 'Presentation Tools',
      },
      '/report-generator': {
        title: `Report Generator - ${appConfig.title}`,
        description: 'Generate comprehensive academic reports and documents.',
        keywords: ['report generator', 'academic reports', 'document creation', 'AI writing'],
        section: 'Writing Tools',
      },
      '/summarizer-paraphraser': {
        title: `Text Summarizer & Paraphraser - ${appConfig.title}`,
        description: 'Summarize and paraphrase text content with advanced AI.',
        keywords: ['text summarizer', 'paraphraser', 'content processing', 'AI text tools'],
        section: 'Text Processing',
      },
      '/mind-map-generator': {
        title: `Mind Map Generator - ${appConfig.title}`,
        description: 'Create visual mind maps from text content for better understanding.',
        keywords: ['mind map generator', 'visual learning', 'concept mapping', 'knowledge visualization'],
        section: 'Visualization Tools',
      },
      '/ocr-extractor': {
        title: `OCR Text Extractor - ${appConfig.title}`,
        description: 'Extract text from images and PDFs with advanced OCR technology.',
        keywords: ['OCR', 'text extraction', 'image to text', 'PDF text extraction'],
        section: 'Conversion Tools',
      },
      '/citation-generator': {
        title: `Citation Generator - ${appConfig.title}`,
        description: 'Generate academic citations in various formats automatically.',
        keywords: ['citation generator', 'academic citations', 'bibliography', 'reference formatting'],
        section: 'Academic Tools',
      },
    };

    return pageData[page] || this.defaultData;
  }

  public addStructuredData(data: any): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  public addOrganizationStructuredData(): void {
    const organizationData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: appConfig.title,
      description: appConfig.description,
      url: appConfig.url,
      logo: `${appConfig.url}/favicon.ico`,
      sameAs: [
        socialConfig.twitter ? `https://twitter.com/${socialConfig.twitter}` : '',
        socialConfig.facebook || '',
        socialConfig.linkedin || '',
      ].filter(Boolean),
    };

    this.addStructuredData(organizationData);
  }

  public addWebsiteStructuredData(): void {
    const websiteData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: appConfig.title,
      description: appConfig.description,
      url: appConfig.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${appConfig.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    this.addStructuredData(websiteData);
  }
}

// React hook for SEO
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSEO = (customData?: Partial<SEOData>) => {
  const location = useLocation();

  useEffect(() => {
    SEOManager.getInstance().setPageSEO(location.pathname, customData);
  }, [location.pathname, customData]);
};

// Export singleton
export const seoManager = SEOManager.getInstance();

export default seoManager;