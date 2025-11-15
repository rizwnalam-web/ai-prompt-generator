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

export type ApiProviderType = 'gemini' | 'openai' | 'grok' | 'deepseek';

export interface ApiProviderConfig {
  id: string;
  name: string;
  provider: ApiProviderType;
  apiKey: string;
  model: string;
}

// FIX: Define a named interface for the aistudio object on the window to prevent type conflicts with other global declarations.
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}
