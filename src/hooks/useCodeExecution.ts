import { useState, useCallback } from 'react';
import { LANGUAGE_CONFIG, ExecutionResult } from '@/types/ide';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export function useCodeExecution(apiKey: string) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  const executeCode = useCallback(async (code: string, language: string, stdin: string = '') => {
    const config = LANGUAGE_CONFIG[language];
    if (!config || config.id === 0) {
      setOutput('⚠️ This language cannot be executed. Use the Preview panel for HTML/CSS.');
      return;
    }

    if (!apiKey) {
      setOutput('⚠️ Please set your Judge0 API key (RapidAPI) in Settings to run code.');
      return;
    }

    setIsRunning(true);
    setOutput('⏳ Running...');

    try {
      const submitRes = await fetch(`${JUDGE0_API}/submissions?base64_encoded=true&wait=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          language_id: config.id,
          source_code: btoa(unescape(encodeURIComponent(code))),
          stdin: btoa(unescape(encodeURIComponent(stdin))),
        }),
      });

      if (!submitRes.ok) {
        const errText = await submitRes.text();
        throw new Error(`Submit failed (${submitRes.status}): ${errText}`);
      }

      const { token } = await submitRes.json();

      let result: ExecutionResult | null = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const pollRes = await fetch(`${JUDGE0_API}/submissions/${token}?base64_encoded=true`, {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          },
        });
        const data = await pollRes.json();
        if (data.status?.id >= 3) {
          result = data;
          break;
        }
      }

      if (!result) {
        setOutput('⏰ Execution timed out.');
        return;
      }

      const decode = (s: string | null) => s ? decodeURIComponent(escape(atob(s))) : '';
      const stdout = decode(result.stdout as unknown as string);
      const stderr = decode(result.stderr as unknown as string);
      const compileOut = decode(result.compile_output as unknown as string);

      let outputText = '';
      if (result.status.id === 3) {
        outputText = `✅ ${result.status.description}\n`;
        if (stdout) outputText += `\n${stdout}`;
        if (result.time) outputText += `\n⏱️ Time: ${result.time}s`;
        if (result.memory) outputText += ` | 💾 Memory: ${Math.round(result.memory / 1024)}KB`;
      } else {
        outputText = `❌ ${result.status.description}\n`;
        if (compileOut) outputText += `\n${compileOut}`;
        if (stderr) outputText += `\n${stderr}`;
      }

      setOutput(outputText);
    } catch (err) {
      setOutput(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}\n\nThis may be due to network restrictions. Check your API key and network access.`);
    } finally {
      setIsRunning(false);
    }
  }, [apiKey]);

  const clearOutput = useCallback(() => setOutput(''), []);

  return { isRunning, output, executeCode, clearOutput, setOutput };
}
