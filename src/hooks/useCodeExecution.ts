import { useState, useCallback } from 'react';
import { LANGUAGE_CONFIG } from '@/types/ide';

const PISTON_API = 'https://emkc.org/api/v2/piston';

const PISTON_LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  java: { language: 'java', version: '15.0.2' },
  csharp: { language: 'csharp', version: '6.12.0' },
};

export function useCodeExecution() {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  const executeCode = useCallback(async (code: string, language: string, stdin: string = '') => {
    const config = LANGUAGE_CONFIG[language];
    if (!config || config.id === 0) {
      setOutput('⚠️ This language cannot be executed. Use the Preview panel for HTML/CSS.');
      return;
    }

    const pistonLang = PISTON_LANGUAGE_MAP[language];
    if (!pistonLang) {
      setOutput('⚠️ This language is not supported for execution.');
      return;
    }

    setIsRunning(true);
    setOutput('⏳ Running...');

    try {
      const res = await fetch(`${PISTON_API}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: pistonLang.language,
          version: pistonLang.version,
          files: [{ content: code }],
          stdin,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Execution failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const run = data.run;

      let outputText = '';
      if (run.code === 0) {
        outputText = `✅ Executed successfully\n`;
        if (run.stdout) outputText += `\n${run.stdout}`;
      } else {
        outputText = `❌ Exit code: ${run.code}\n`;
        if (run.stdout) outputText += `\n${run.stdout}`;
        if (run.stderr) outputText += `\n${run.stderr}`;
      }

      if (data.compile && data.compile.stderr) {
        outputText = `❌ Compilation error\n\n${data.compile.stderr}`;
      }

      setOutput(outputText);
    } catch (err) {
      setOutput(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}\n\nThis may be due to network restrictions.`);
    } finally {
      setIsRunning(false);
    }
  }, []);

  const clearOutput = useCallback(() => setOutput(''), []);

  return { isRunning, output, executeCode, clearOutput, setOutput };
}
