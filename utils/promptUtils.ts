
import { PromptInputs, PromptTemplate } from "../types";

export const assemblePrompt = (inputs: PromptInputs, template: PromptTemplate): string => {
    let finalPrompt = "";

    // 1. Persona
    if (inputs.persona) {
        finalPrompt += `Act as ${inputs.persona}.\n\n`;
    }

    // 2. Main Task (from template)
    let taskPrompt = template.basePrompt;
    template.variables.forEach(variable => {
        const value = inputs[variable.key] || `[${variable.label}]`;
        taskPrompt = taskPrompt.replace(`[${variable.key}]`, value);
    });
    finalPrompt += `Your task is to: ${taskPrompt}\n\n`;

    // 3. Context
    if (inputs.context) {
        finalPrompt += `Use the following context as background information:\n---\n${inputs.context}\n---\n\n`;
    }

    // 4. Constraints & Parameters
    finalPrompt += `Please adhere to the following constraints:\n`;
    if (inputs.audience) finalPrompt += `- Target Audience: ${inputs.audience}\n`;
    if (inputs.tone) finalPrompt += `- Tone: ${inputs.tone}\n`;
    if (inputs.style) finalPrompt += `- Style: ${inputs.style}\n`;
    if (inputs.format) finalPrompt += `- Output Format: ${inputs.format}\n`;
    if (inputs.length) finalPrompt += `- Length: ${inputs.length}\n`;
    
    // 5. Negative Constraints
    if (inputs.negativeConstraints) {
        finalPrompt += `\nIMPORTANT: Do NOT include the following:\n- ${inputs.negativeConstraints.split('\n').join('\n- ')}\n`;
    }

    return finalPrompt.trim();
};
