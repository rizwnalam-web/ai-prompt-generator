import { PromptTemplate } from './types';

export const TONE_OPTIONS = ["Professional", "Friendly", "Humorous", "Authoritative", "Empathetic", "Formal", "Informal"];
export const STYLE_OPTIONS = ["Concise", "Descriptive", "Academic", "Journalistic", "Narrative", "Persuasive"];
export const FORMAT_OPTIONS = ["Plain Text", "Markdown", "JSON", "Bullet Points", "Numbered List", "HTML"];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
    {
        id: 'blog-post',
        name: 'Blog Post Idea',
        description: 'Generate a blog post outline or full content.',
        basePrompt: 'Generate a blog post titled "[TITLE]" about [TOPIC]. The post should include an engaging introduction, a main body covering these key points: [KEY_POINTS], and a concluding paragraph with a clear call to action: [CALL_TO_ACTION].',
        variables: [
            { key: 'TITLE', label: 'Blog Post Title', placeholder: 'e.g., 10 Ways AI is Revolutionizing Web Development', type: 'input' },
            { key: 'TOPIC', label: 'Main Topic', placeholder: 'e.g., The impact of AI on modern web development practices', type: 'input' },
            { key: 'KEY_POINTS', label: 'Key Points', placeholder: 'e.g., - AI-powered code generation\n- Automated testing\n- Personalized user experiences', type: 'textarea' },
            { key: 'CALL_TO_ACTION', label: 'Call to Action', placeholder: 'e.g., "Share your thoughts in the comments below!"', type: 'input' },
        ],
        category: 'Content Creation',
    },
    {
        id: 'email-draft',
        name: 'Email Draft',
        description: 'Create a professional or casual email.',
        basePrompt: 'Draft an email to [RECIPIENT] with the subject line "[SUBJECT]". The core message is: [MESSAGE]. Please sign off with "[SIGN_OFF]" from [SENDER_NAME].',
        variables: [
            { key: 'RECIPIENT', label: 'Recipient', placeholder: 'e.g., The Marketing Team', type: 'input' },
            { key: 'SUBJECT', label: 'Subject', placeholder: 'e.g., Q3 Marketing Campaign Kick-off', type: 'input' },
            { key: 'MESSAGE', label: 'Main Message', placeholder: 'Summarize the core message of the email, including any questions or required actions.', type: 'textarea' },
            { key: 'SENDER_NAME', label: 'Sender Name', placeholder: 'e.g., Alex Johnson', type: 'input' },
            { key: 'SIGN_OFF', label: 'Desired Sign-off', placeholder: 'e.g., Best regards, Cheers, Sincerely', type: 'input' },
        ],
        category: 'Communication',
    },
    {
        id: 'code-generator',
        name: 'Code Snippet Generator',
        description: 'Generate code in a specific language.',
        basePrompt: 'Write a function in [LANGUAGE] that [FUNCTION_PURPOSE]. It must adhere to these requirements: [REQUIREMENTS]. Include a brief explanation and a usage example.',
        variables: [
            { key: 'LANGUAGE', label: 'Programming Language', placeholder: 'e.g., Python, JavaScript, TypeScript', type: 'input' },
            { key: 'FUNCTION_PURPOSE', label: 'Function Purpose', placeholder: 'e.g., takes a list of numbers and returns the sum', type: 'textarea' },
            { key: 'REQUIREMENTS', label: 'Specific Requirements', placeholder: 'e.g., - Must be asynchronous\n- Handle null inputs gracefully\n- Add comments for clarity', type: 'textarea' },
        ],
        category: 'Development',
    },
    {
        id: 'class-generator',
        name: 'Class Generator',
        description: 'Generate a class structure in an object-oriented language.',
        basePrompt: 'Create a class named `[CLASS_NAME]` in [LANGUAGE]. The purpose of this class is to [FUNCTION_PURPOSE]. It should have the following properties and methods, and adhere to these requirements: [REQUIREMENTS].',
        variables: [
            { key: 'LANGUAGE', label: 'Programming Language', placeholder: 'e.g., TypeScript, Python, Java', type: 'input' },
            { key: 'CLASS_NAME', label: 'Class Name', placeholder: 'e.g., User, DataProcessor', type: 'input' },
            { key: 'FUNCTION_PURPOSE', label: 'Purpose of the Class', placeholder: 'e.g., manage user data and authentication', type: 'textarea' },
            { key: 'REQUIREMENTS', label: 'Properties, Methods, and Requirements', placeholder: 'e.g.,- Properties: id, username, email\n- Methods: constructor, save(), delete()\n- Must be immutable', type: 'textarea' },
        ],
        category: 'Development',
    },
     {
        id: 'story-generator',
        name: 'Story Generator',
        description: 'Generate a short story script, then create voice and video.',
        basePrompt: 'Generate a short story script based on the following details. The story should be imaginative and suitable for a short animated video.\n\nTheme: [THEME]\n\nCharacters:\n[CHARACTERS]\n\nKey Plot Points:\n[PLOT_POINTS]',
        variables: [
            { key: 'THEME', label: 'Story Theme', placeholder: 'e.g., A magical friendship, a space adventure', type: 'input' },
            { key: 'CHARACTERS', label: 'Main Characters', placeholder: 'e.g., - A curious fox named Finn\n- A grumpy but wise old owl', type: 'textarea' },
            { key: 'PLOT_POINTS', label: 'Key Plot Points', placeholder: 'e.g., - The characters discover a hidden map\n- They overcome a challenge\n- They find a surprising treasure', type: 'textarea' },
        ],
        category: 'Creative',
    },
    {
        id: 'social-media-post',
        name: 'Social Media Post',
        description: 'Craft a post for various social media platforms.',
        basePrompt: 'Create a social media post for [PLATFORM] about [CONTENT_IDEA]. Include a clear call to action: [CALL_TO_ACTION]. Suggest relevant hashtags like [HASHTAGS].',
        variables: [
            { key: 'PLATFORM', label: 'Platform', placeholder: 'e.g., Twitter, LinkedIn, Instagram', type: 'input' },
            { key: 'CONTENT_IDEA', label: 'Content Idea', placeholder: 'e.g., Announcing a new product feature for real-time collaboration.', type: 'textarea' },
            { key: 'CALL_TO_ACTION', label: 'Call to Action', placeholder: 'e.g., "Check it out now!", "What do you think?"', type: 'input' },
            { key: 'HASHTAGS', label: 'Example Hashtags', placeholder: 'e.g., #AI, #NewFeature, #Tech', type: 'input' },
        ],
        category: 'Content Creation',
    },
    {
        id: 'summarize-document',
        name: 'Document Summarizer',
        description: 'Summarize a piece of text.',
        basePrompt: 'Provide a summary of the following text in the form of [SUMMARY_TYPE]:\n\n[DOCUMENT_TEXT]',
        variables: [
            { key: 'SUMMARY_TYPE', label: 'Type of Summary', placeholder: 'e.g., key bullet points, a short paragraph, an executive summary', type: 'input' },
            { key: 'DOCUMENT_TEXT', label: 'Document Text', placeholder: 'Paste the text you want to summarize here.', type: 'textarea' },
        ],
        category: 'Productivity',
    }
];
