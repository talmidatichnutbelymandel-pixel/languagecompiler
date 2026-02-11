import { BookOpen, Terminal, Code, Play, FolderOpen, GitBranch, Settings, Keyboard, Monitor } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WelcomeTabProps {
  onAction: (action: string) => void;
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold flex items-center gap-2 mb-2 text-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </h2>
      <div className="text-xs text-muted-foreground leading-relaxed pl-6">{children}</div>
    </div>
  );
}

function Shortcut({ keys, desc }: { keys: string; desc: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{desc}</span>
      <kbd className="text-[10px] bg-accent px-1.5 py-0.5 rounded font-mono text-accent-foreground">{keys}</kbd>
    </div>
  );
}

function ActionLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="text-primary hover:underline text-xs">
      {children}
    </button>
  );
}

export default function WelcomeTab({ onAction }: WelcomeTabProps) {
  return (
    <ScrollArea className="h-full bg-background">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome to CodeCloud IDE</h1>
          <p className="text-sm text-muted-foreground">Browser-based development environment</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button onClick={() => onAction('new-file')} className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition-colors">
            <Code className="h-4 w-4 text-primary mb-1" />
            <div className="text-xs font-medium text-foreground">New File</div>
            <div className="text-[10px] text-muted-foreground">Create an empty file</div>
          </button>
          <button onClick={() => onAction('open-file')} className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition-colors">
            <FolderOpen className="h-4 w-4 text-primary mb-1" />
            <div className="text-xs font-medium text-foreground">Open File / Folder</div>
            <div className="text-[10px] text-muted-foreground">Import from your computer</div>
          </button>
          <button onClick={() => onAction('toggle-terminal')} className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition-colors">
            <Terminal className="h-4 w-4 text-primary mb-1" />
            <div className="text-xs font-medium text-foreground">Open Terminal</div>
            <div className="text-[10px] text-muted-foreground">Use CLI commands</div>
          </button>
          <button onClick={() => onAction('toggle-preview')} className="p-3 rounded-lg bg-card border border-border hover:border-primary/50 text-left transition-colors">
            <Monitor className="h-4 w-4 text-primary mb-1" />
            <div className="text-xs font-medium text-foreground">Open Preview</div>
            <div className="text-[10px] text-muted-foreground">Live preview HTML files</div>
          </button>
        </div>

        <Section icon={BookOpen} title="Getting Started">
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Create a project: Use the <strong>+</strong> button or terminal <code className="bg-accent px-1 rounded text-[10px]">npx create-react-app my-app</code></li>
            <li>Edit code in the editor with full syntax highlighting and autocomplete</li>
            <li>Open <strong>index.html</strong> and click the <strong>Preview</strong> icon (monitor) to see the result</li>
            <li>Run server-side code (Python, Java, C#, JS) with <strong>Ctrl+Enter</strong></li>
          </ol>
        </Section>

        <Section icon={Terminal} title="Terminal Commands">
          <div className="space-y-1">
            <p><code className="bg-accent px-1 rounded text-[10px]">npx create-react-app my-app</code> — Create React project</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">ng new my-app</code> — Create Angular project</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">npm start</code> / <code className="bg-accent px-1 rounded text-[10px]">ng serve</code> — Run project</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">npm install &lt;pkg&gt;</code> — Install packages</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">cd</code>, <code className="bg-accent px-1 rounded text-[10px]">ls</code>, <code className="bg-accent px-1 rounded text-[10px]">mkdir</code>, <code className="bg-accent px-1 rounded text-[10px]">touch</code> — File navigation</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">ng generate component &lt;name&gt;</code> — Angular CLI</p>
          </div>
        </Section>

        <Section icon={GitBranch} title="Git Integration">
          <div className="space-y-1">
            <p><code className="bg-accent px-1 rounded text-[10px]">git init</code> — Initialize repository</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">git add .</code> — Stage all files</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">git commit -m "message"</code> — Commit changes</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">git remote add origin &lt;url&gt;</code> — Add remote</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">git push</code> — Push to remote</p>
            <p><code className="bg-accent px-1 rounded text-[10px]">git log</code> — Show commit history</p>
          </div>
        </Section>

        <Section icon={Play} title="Running Code">
          <p>Open any code file and press <strong>Ctrl+Enter</strong> to execute it.</p>
          <p className="mt-1">Supported languages: <strong>Python</strong>, <strong>JavaScript</strong>, <strong>TypeScript</strong>, <strong>Java</strong>, <strong>C#</strong></p>
          <p className="mt-1">For HTML files, use the <strong>Preview</strong> panel for live rendering.</p>
        </Section>

        <Section icon={Keyboard} title="Keyboard Shortcuts">
          <div className="bg-card rounded-lg p-3 border border-border">
            <Shortcut keys="Ctrl+P" desc="Quick Open (files)" />
            <Shortcut keys="Ctrl+Shift+P" desc="Command Palette" />
            <Shortcut keys="Ctrl+N" desc="New File" />
            <Shortcut keys="Ctrl+B" desc="Toggle Sidebar" />
            <Shortcut keys="Ctrl+`" desc="Toggle Terminal" />
            <Shortcut keys="Ctrl+Enter" desc="Run Code" />
            <Shortcut keys="Ctrl+S" desc="Save" />
            <Shortcut keys="Ctrl+W" desc="Close Tab" />
            <Shortcut keys="Ctrl+Tab" desc="Next Tab" />
            <Shortcut keys="Ctrl+," desc="Settings" />
            <Shortcut keys="Ctrl+Shift+E" desc="Explorer" />
            <Shortcut keys="Ctrl+Shift+F" desc="Search" />
            <Shortcut keys="Ctrl+Shift+G" desc="Source Control" />
          </div>
        </Section>

        <Section icon={Settings} title="Settings">
          <p>Click the <strong>⚙️ gear icon</strong> in the Activity Bar or press <strong>Ctrl+,</strong> to customize:</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5">
            <li>Font size and family</li>
            <li>Tab size (2/4/8 spaces)</li>
            <li>Word wrap, minimap, line numbers</li>
            <li>Color theme (Dark/Light)</li>
            <li>Auto-save and format on save</li>
            <li>Cursor style and whitespace rendering</li>
          </ul>
        </Section>
      </div>
    </ScrollArea>
  );
}
