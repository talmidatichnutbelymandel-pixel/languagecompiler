// judge0Engine.ts

import axios from 'axios';

export class Judge0Engine {
    private apiUrl: string;
    
    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
    }

    public async executeCode(language: string, sourceCode: string, stdin: string = ''): Promise<any> {
        try {
            const response = await axios.post(`${this.apiUrl}/submissions`, {
                language_id: this.getLanguageId(language),
                source_code: sourceCode,
                stdin
            });
            return response.data;
        } catch (error) {
            console.error('Error executing code:', error);
            throw error;
        }
    }

    private getLanguageId(language: string): number {
        const languages = {
            'python': 34,
            'javascript': 63,
            'java': 62,
            'c': 50,
            'cpp': 54
            // Add more languages as needed
        };
        return languages[language] || 0; // return 0 for unknown languages
    }
}
