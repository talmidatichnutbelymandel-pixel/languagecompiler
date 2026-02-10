import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, X } from 'lucide-react';
import { PROJECT_TEMPLATES, getTemplateByFramework } from '@/lib/projectTemplates';
import { FileNode } from '@/types/ide';

interface TerminalPanelProps {
  onCreateProject: (template: FileNode) => void;
  onOpenFile: (fileId: string) => void;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  text: string;
}

const HELP_TEXT = `Available commands:
  create-project <framework> <name>  - Create a new project
    Frameworks: react, angular
    Example: create-project react my-app

  templates                          - List available templates
  help                               - Show this help message
  clear                              - Clear terminal`;

export default function TerminalPanel({ onCreateProject, onOpenFile }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: '🖥️ CodeCloud Terminal v1.0' },
    { type: 'info', text: 'Type "help" for available commands.\n' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { type, text }]);
  }, []);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine('input', `$ ${trimmed}`);
    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case 'help':
        addLine('output', HELP_TEXT);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'templates':
        addLine('output', 'Available templates:');
        PROJECT_TEMPLATES.forEach(t => {
          addLine('info', `  📦 ${t.framework} - ${t.name}: ${t.description}`);
        });
        break;

      case 'create-project': {
        const framework = parts[1];
        const name = parts[2] || `${framework}-app`;

        if (!framework) {
          addLine('error', 'Usage: create-project <framework> <name>');
          addLine('info', 'Frameworks: react, angular');
          break;
        }

        const template = getTemplateByFramework(framework);
        if (!template) {
          addLine('error', `Unknown framework: "${framework}"`);
          addLine('info', 'Available: react, angular');
          break;
        }

        addLine('info', `📦 Creating ${template.name} project "${name}"...`);
        addLine('output', `  ├── ${name}/`);
        
        const projectNode = template.create(name);
        if (projectNode.children) {
          projectNode.children.forEach((child, i) => {
            const isLast = i === projectNode.children!.length - 1;
            addLine('output', `  ${isLast ? '└' : '├'}── ${child.name}`);
          });
        }

        onCreateProject(projectNode);

        addLine('success', `\n✅ Project "${name}" created successfully!`);
        addLine('info', '💡 Open index.html and click Preview (monitor icon) to see the app.');
        break;
      }

      default:
        addLine('error', `Unknown command: "${command}". Type "help" for available commands.`);
    }
  }, [addLine, onCreateProject]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0) {
        const idx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx >= 0) {
        const idx = historyIdx + 1;
        if (idx >= history.length) {
          setHistoryIdx(-1);
          setInput('');
        } else {
          setHistoryIdx(idx);
          setInput(history[idx]);
        }
      }
    }
  };

  const colorMap: Record<TerminalLine['type'], string> = {
    input: 'text-foreground/70',
    output: 'text-foreground/90',
    error: 'text-destructive',
    success: 'text-green-400',
    info: 'text-primary',
  };

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sidebar-border">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminal</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 font-mono text-xs cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap ${colorMap[line.type]}`}>
            {line.text}
          </div>
        ))}
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-green-400">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-foreground/90 font-mono text-xs"
            spellCheck={false}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
