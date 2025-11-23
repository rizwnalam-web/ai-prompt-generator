
export interface TemplateVariable {
  key: string;
  label: string;
  placeholder: string;
  type: 'input' | 'textarea';
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  variables: TemplateVariable[];
  category?: string;
  createdAt?: number;
}

export interface PromptInputs {
    persona: string;
    audience: string;
    tone: string;
    style: string;
    format: string;
    length: string;
    context: string;
    negativeConstraints: string;
    [key:string]: string; // For dynamic variables
}

export type ApiProviderType = 'gemini' | 'openai' | 'grok' | 'deepseek' | 'anthropic';

export interface ApiProviderConfig {
  id: string;
  name: string;
  provider: ApiProviderType;
  apiKey: string;
  model: string;
}

export interface User {
  id: string;
  email: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}
