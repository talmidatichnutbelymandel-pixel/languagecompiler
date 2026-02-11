import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal } from 'lucide-react';
import { PROJECT_TEMPLATES, getTemplateByFramework } from '@/lib/projectTemplates';
import { FileNode } from '@/types/ide';

interface TerminalPanelProps {
  files: FileNode[];
  onCreateProject: (template: FileNode) => void;
  onOpenFile: (fileId: string) => void;
  onCreateFile: (parentId: string | null, name: string, type: 'file' | 'folder') => string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'warning';
  text: string;
}

interface GitState {
  initialized: boolean;
  branch: string;
  remoteUrl: string;
  staged: string[];
  commits: { hash: string; message: string; date: string }[];
}

const HELP_TEXT = `Available commands:

  📁 File System:
    ls                              - List files in current directory
    cd <dir>                        - Change directory (cd .., cd folder)
    pwd                             - Print working directory
    mkdir <name>                    - Create directory
    touch <name>                    - Create file
    cat <file>                      - Show file contents
    rm <name>                       - Remove file/folder

  📦 Project Creation:
    npx create-react-app <name>     - Create React project
    ng new <name>                   - Create Angular project
    create-project <fw> <name>      - Create project (react/angular)
    templates                       - List available templates

  🚀 Run Projects:
    npm start                       - Run current React project
    npm run dev                     - Run dev server
    ng serve                        - Run Angular project
    npm install / npm i             - Install dependencies
    npm install <pkg>               - Install specific package
    pip install <pkg>               - Install Python package

  🔧 Angular CLI:
    ng generate component <name>    - Generate Angular component
    ng generate service <name>      - Generate Angular service
    ng generate module <name>       - Generate Angular module
    ng g c <name>                   - Short for generate component
    ng g s <name>                   - Short for generate service

  📌 Git:
    git init                        - Initialize repository
    git status                      - Show working tree status
    git add <file>                  - Stage file (or . for all)
    git commit -m "msg"             - Commit staged changes
    git log                         - Show commit log
    git branch                      - List branches
    git checkout -b <name>          - Create and switch branch
    git remote add origin <url>     - Add remote repository
    git push                        - Push to remote
    git pull                        - Pull from remote
    git clone <url>                 - Clone repository

  🛠️ Other:
    node <file>                     - Run JavaScript file
    python <file>                   - Run Python file
    echo <text>                     - Print text
    clear                           - Clear terminal
    help                            - Show this help
    whoami                          - Show current user
    date                            - Show current date/time
    history                         - Show command history`;

export default function TerminalPanel({ files, onCreateProject, onOpenFile, onCreateFile }: TerminalPanelProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'info', text: '🖥️  CodeCloud Terminal v2.0' },
    { type: 'info', text: 'Type "help" for available commands.\n' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [cwd, setCwd] = useState('/');
  const [gitState, setGitState] = useState<GitState>({
    initialized: false,
    branch: 'main',
    remoteUrl: '',
    staged: [],
    commits: [],
  });
  const [installedPackages, setInstalledPackages] = useState<Record<string, string[]>>({
    npm: ['react', 'react-dom'],
    pip: ['pip', 'setuptools'],
  });
  const [runningProcess, setRunningProcess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [lines]);

  const addLine = useCallback((type: TerminalLine['type'], text: string) => {
    setLines(prev => [...prev, { type, text }]);
  }, []);

  const addLines = useCallback((newLines: TerminalLine[]) => {
    setLines(prev => [...prev, ...newLines]);
  }, []);

  // Navigate virtual file system
  const resolveNode = useCallback((path: string): FileNode | null => {
    const parts = path.split('/').filter(Boolean);
    let current: FileNode[] = files;
    let node: FileNode | null = null;

    for (const part of parts) {
      const found = current.find(n => n.name === part);
      if (!found) return null;
      node = found;
      if (found.children) current = found.children;
    }
    return node;
  }, [files]);

  const getCurrentDir = useCallback((): FileNode[] => {
    if (cwd === '/') return files;
    const node = resolveNode(cwd.slice(1));
    return node?.children || files;
  }, [cwd, files, resolveNode]);

  const getCurrentDirNode = useCallback((): FileNode | null => {
    if (cwd === '/') return files[0] || null;
    return resolveNode(cwd.slice(1));
  }, [cwd, files, resolveNode]);

  const resolvePath = useCallback((target: string): string => {
    if (target.startsWith('/')) return target;
    const parts = cwd.split('/').filter(Boolean);
    for (const seg of target.split('/')) {
      if (seg === '..') parts.pop();
      else if (seg !== '.') parts.push(seg);
    }
    return '/' + parts.join('/');
  }, [cwd]);

  const simulateDelay = useCallback((callback: () => void, ms: number) => {
    setTimeout(callback, ms);
  }, []);

  const handleCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    addLine('input', `${cwd} $ ${trimmed}`);
    setHistory(prev => [...prev, trimmed]);
    setHistoryIdx(-1);

    const parts = trimmed.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1).map(a => a.replace(/^"|"$/g, ''));

    switch (command) {
      case 'help':
        addLine('output', HELP_TEXT);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'pwd':
        addLine('output', cwd);
        break;

      case 'whoami':
        addLine('output', 'developer@codecloud');
        break;

      case 'date':
        addLine('output', new Date().toString());
        break;

      case 'echo':
        addLine('output', args.join(' '));
        break;

      case 'history':
        history.forEach((h, i) => addLine('output', `  ${i + 1}  ${h}`));
        break;

      case 'ls': {
        const dirItems = getCurrentDir();
        if (dirItems.length === 0) {
          addLine('output', '(empty directory)');
        } else {
          const formatted = dirItems.map(n =>
            n.type === 'folder' ? `📁 ${n.name}/` : `📄 ${n.name}`
          ).join('\n');
          addLine('output', formatted);
        }
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          setCwd('/');
          break;
        }
        if (target === '..') {
          const parts = cwd.split('/').filter(Boolean);
          parts.pop();
          setCwd('/' + parts.join('/'));
          break;
        }
        if (target === '.') break;

        const newPath = resolvePath(target);
        const node = newPath === '/' ? null : resolveNode(newPath.slice(1));
        
        if (newPath === '/' || (node && node.type === 'folder')) {
          setCwd(newPath === '/' ? '/' : newPath);
        } else if (node && node.type === 'file') {
          addLine('error', `cd: not a directory: ${target}`);
        } else {
          addLine('error', `cd: no such file or directory: ${target}`);
        }
        break;
      }

      case 'mkdir': {
        const name = args[0];
        if (!name) { addLine('error', 'mkdir: missing operand'); break; }
        const parentNode = getCurrentDirNode();
        onCreateFile(parentNode?.id || null, name, 'folder');
        addLine('success', `Created directory: ${name}`);
        break;
      }

      case 'touch': {
        const name = args[0];
        if (!name) { addLine('error', 'touch: missing operand'); break; }
        const parentNode = getCurrentDirNode();
        onCreateFile(parentNode?.id || null, name, 'file');
        addLine('success', `Created file: ${name}`);
        break;
      }

      case 'cat': {
        const fileName = args[0];
        if (!fileName) { addLine('error', 'cat: missing operand'); break; }
        const items = getCurrentDir();
        const file = items.find(n => n.name === fileName && n.type === 'file');
        if (!file) { addLine('error', `cat: ${fileName}: No such file`); break; }
        addLine('output', file.content || '(empty file)');
        break;
      }

      case 'rm': {
        const name = args[0];
        if (!name) { addLine('error', 'rm: missing operand'); break; }
        addLine('warning', `rm: removed '${name}' (simulated - use file tree for actual deletion)`);
        break;
      }

      case 'templates':
        addLine('output', 'Available templates:');
        PROJECT_TEMPLATES.forEach(t => {
          addLine('info', `  📦 ${t.framework} - ${t.name}: ${t.description}`);
        });
        break;

      case 'npx': {
        if (args[0] === 'create-react-app') {
          const name = args[1] || 'my-react-app';
          addLine('info', `\nCreating a new React app in ./${name}...`);
          addLine('output', '');
          addLine('info', 'Installing packages:');
          addLine('output', '  react');
          addLine('output', '  react-dom');
          addLine('output', '  react-scripts');

          const template = getTemplateByFramework('react');
          if (template) {
            const projectNode = template.create(name);
            onCreateProject(projectNode);
            addLine('success', `\n✅ Success! Created ${name}`);
            addLine('info', `\nWe suggest that you begin by typing:\n  cd ${name}\n  npm start`);
          }
        } else {
          addLine('error', `npx: command '${args[0]}' not found`);
        }
        break;
      }

      case 'create-project': {
        const framework = args[0];
        const name = args[1] || `${framework}-app`;
        if (!framework) { addLine('error', 'Usage: create-project <framework> <name>'); break; }
        const template = getTemplateByFramework(framework);
        if (!template) { addLine('error', `Unknown framework: "${framework}". Available: react, angular`); break; }
        addLine('info', `📦 Creating ${template.name} project "${name}"...`);
        const projectNode = template.create(name);
        onCreateProject(projectNode);
        addLine('success', `\n✅ Project "${name}" created successfully!`);
        addLine('info', '💡 Open index.html and click Preview to see the app.');
        break;
      }

      case 'ng': {
        const subCmd = args[0];
        if (subCmd === 'new') {
          const name = args[1] || 'my-angular-app';
          addLine('info', `\n🅰️  Creating Angular project "${name}"...`);
          addLine('output', '  Installing Angular dependencies...');
          addLine('output', '  ✔ Packages installed successfully.');

          const template = getTemplateByFramework('angular');
          if (template) {
            const projectNode = template.create(name);
            onCreateProject(projectNode);
            addLine('success', `\n✅ Project "${name}" created!`);
            addLine('info', `  cd ${name}\n  ng serve`);
          }
        } else if (subCmd === 'serve') {
          addLine('info', '🅰️  Compiling Angular application...');
          addLine('output', '  ✔ Browser application bundle generation complete.');
          addLine('success', '\n  ** Angular Live Development Server is listening on localhost:4200 **');
          addLine('info', '  💡 Open index.html and click Preview (monitor icon) to see the app.');
          setRunningProcess('ng serve');
        } else if (subCmd === 'generate' || subCmd === 'g') {
          const type = args[1];
          const name = args[2];
          if (!type || !name) {
            addLine('error', 'Usage: ng generate <type> <name>');
            addLine('info', 'Types: component (c), service (s), module (m), directive (d), pipe (p)');
            break;
          }
          const fullType = { c: 'component', s: 'service', m: 'module', d: 'directive', p: 'pipe' }[type] || type;
          const parentNode = getCurrentDirNode();

          if (fullType === 'component') {
            const folderId = onCreateFile(parentNode?.id || null, name, 'folder');
            addLine('success', `CREATE src/app/${name}/${name}.component.ts`);
            addLine('success', `CREATE src/app/${name}/${name}.component.html`);
            addLine('success', `CREATE src/app/${name}/${name}.component.css`);
            addLine('success', `CREATE src/app/${name}/${name}.component.spec.ts`);
            addLine('info', `UPDATE src/app/app.module.ts`);
          } else if (fullType === 'service') {
            addLine('success', `CREATE src/app/${name}.service.ts`);
            addLine('success', `CREATE src/app/${name}.service.spec.ts`);
          } else if (fullType === 'module') {
            addLine('success', `CREATE src/app/${name}/${name}.module.ts`);
          } else {
            addLine('success', `CREATE src/app/${name}.${fullType}.ts`);
          }
        } else if (subCmd === 'version' || subCmd === 'v') {
          addLine('output', 'Angular CLI: 17.3.0\nNode: 20.11.0\nPackage Manager: npm 10.2.0');
        } else {
          addLine('error', `ng: unknown command "${subCmd}". See "ng help".`);
        }
        break;
      }

      case 'npm': {
        const subCmd = args[0];
        if (subCmd === 'start' || subCmd === 'run') {
          const script = subCmd === 'run' ? (args[1] || 'dev') : 'start';
          addLine('info', `\n> project@1.0.0 ${script}`);
          addLine('output', '> react-scripts start\n');
          addLine('info', 'Compiled successfully!\n');
          addLine('success', '  Local:            http://localhost:3000');
          addLine('success', '  On Your Network:  http://192.168.1.100:3000\n');
          addLine('info', '💡 Open index.html and click Preview (monitor icon) to see the app.');
          setRunningProcess(`npm ${script}`);
        } else if (subCmd === 'install' || subCmd === 'i') {
          const pkg = args[1];
          if (pkg) {
            addLine('info', `Installing ${pkg}...`);
            addLine('output', `+ ${pkg}@latest`);
            addLine('success', `added 1 package in 1.2s`);
            setInstalledPackages(prev => ({
              ...prev,
              npm: [...(prev.npm || []), pkg],
            }));
          } else {
            addLine('info', 'Installing dependencies...');
            addLine('output', '\nadded 1247 packages in 32s\n');
            addLine('success', '✅ All dependencies installed successfully.');
          }
        } else if (subCmd === 'list' || subCmd === 'ls') {
          addLine('output', 'project@1.0.0');
          installedPackages.npm?.forEach(p => addLine('output', `├── ${p}@latest`));
        } else if (subCmd === 'init') {
          addLine('success', 'Wrote to package.json');
          addLine('output', '{\n  "name": "project",\n  "version": "1.0.0"\n}');
        } else if (subCmd === 'test') {
          addLine('info', '> project@1.0.0 test\nPASS  All tests passed.');
        } else if (subCmd === 'build') {
          addLine('info', '> project@1.0.0 build');
          addLine('output', 'Creating an optimized production build...');
          addLine('success', '\n✅ Compiled successfully.\nBuild folder is ready to be deployed.');
        } else {
          addLine('error', `npm: unknown command "${subCmd}"`);
        }
        break;
      }

      case 'pip': {
        if (args[0] === 'install') {
          const pkg = args[1];
          if (!pkg) { addLine('error', 'Usage: pip install <package>'); break; }
          addLine('info', `Collecting ${pkg}...`);
          addLine('output', `  Downloading ${pkg}-latest.tar.gz`);
          addLine('success', `Successfully installed ${pkg}-latest`);
          setInstalledPackages(prev => ({
            ...prev,
            pip: [...(prev.pip || []), pkg],
          }));
        } else if (args[0] === 'list') {
          addLine('output', 'Package        Version');
          addLine('output', '-------------- -------');
          installedPackages.pip?.forEach(p => addLine('output', `${p.padEnd(15)}latest`));
        } else {
          addLine('error', `pip: unknown command "${args[0]}"`);
        }
        break;
      }

      case 'node':
      case 'python': {
        const fileName = args[0];
        if (!fileName) { addLine('error', `Usage: ${command} <file>`); break; }
        addLine('info', `Running ${fileName} with ${command}...`);
        addLine('info', '💡 Use Ctrl+Enter in the editor to run code with full output.');
        break;
      }

      // Git commands
      case 'git': {
        const subCmd = args[0];

        if (!subCmd) { addLine('error', 'usage: git <command> [<args>]'); break; }

        switch (subCmd) {
          case 'init':
            setGitState(prev => ({ ...prev, initialized: true }));
            addLine('success', 'Initialized empty Git repository in .git/');
            break;

          case 'status':
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            addLine('output', `On branch ${gitState.branch}`);
            if (gitState.staged.length > 0) {
              addLine('success', 'Changes to be committed:');
              gitState.staged.forEach(f => addLine('success', `  new file:   ${f}`));
            }
            const unstaged = getCurrentDir().map(n => n.name).filter(n => !gitState.staged.includes(n));
            if (unstaged.length > 0) {
              addLine('error', '\nUntracked files:');
              unstaged.forEach(f => addLine('error', `  ${f}`));
            }
            if (gitState.staged.length === 0 && unstaged.length === 0) {
              addLine('output', 'nothing to commit, working tree clean');
            }
            break;

          case 'add': {
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            const target = args[1];
            if (!target) { addLine('error', 'Nothing specified, nothing added.'); break; }
            if (target === '.') {
              const allFiles = getCurrentDir().map(n => n.name);
              setGitState(prev => ({ ...prev, staged: [...new Set([...prev.staged, ...allFiles])] }));
              addLine('output', `Added all files to staging area.`);
            } else {
              setGitState(prev => ({ ...prev, staged: [...new Set([...prev.staged, target])] }));
              addLine('output', `Added '${target}' to staging area.`);
            }
            break;
          }

          case 'commit': {
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            const mFlag = args.indexOf('-m');
            const message = mFlag >= 0 ? args[mFlag + 1] : null;
            if (!message) { addLine('error', 'error: switch `m\' requires a value'); break; }
            if (gitState.staged.length === 0) { addLine('error', 'nothing to commit'); break; }
            const hash = Math.random().toString(36).slice(2, 9);
            setGitState(prev => ({
              ...prev,
              staged: [],
              commits: [...prev.commits, { hash, message, date: new Date().toISOString() }],
            }));
            addLine('success', `[${gitState.branch} ${hash}] ${message}`);
            addLine('output', ` ${gitState.staged.length} file(s) changed`);
            break;
          }

          case 'log':
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            if (gitState.commits.length === 0) {
              addLine('output', 'No commits yet.');
            } else {
              gitState.commits.slice().reverse().forEach(c => {
                addLine('warning', `commit ${c.hash}`);
                addLine('output', `Date:   ${c.date}`);
                addLine('output', `\n    ${c.message}\n`);
              });
            }
            break;

          case 'branch':
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            addLine('success', `* ${gitState.branch}`);
            break;

          case 'checkout':
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            if (args[1] === '-b' && args[2]) {
              setGitState(prev => ({ ...prev, branch: args[2] }));
              addLine('success', `Switched to a new branch '${args[2]}'`);
            } else if (args[1]) {
              setGitState(prev => ({ ...prev, branch: args[1] }));
              addLine('success', `Switched to branch '${args[1]}'`);
            }
            break;

          case 'remote':
            if (args[1] === 'add' && args[2] === 'origin' && args[3]) {
              setGitState(prev => ({ ...prev, remoteUrl: args[3] }));
              addLine('success', `Remote 'origin' added: ${args[3]}`);
            } else if (args[1] === '-v') {
              if (gitState.remoteUrl) {
                addLine('output', `origin  ${gitState.remoteUrl} (fetch)`);
                addLine('output', `origin  ${gitState.remoteUrl} (push)`);
              } else {
                addLine('output', '(no remotes configured)');
              }
            }
            break;

          case 'push':
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            if (!gitState.remoteUrl) { addLine('error', "fatal: No configured push destination.\nUse: git remote add origin <url>"); break; }
            addLine('info', `Enumerating objects: ${gitState.commits.length * 3}, done.`);
            addLine('info', 'Counting objects: 100% done.');
            addLine('info', 'Writing objects: 100% done.');
            addLine('success', `\nTo ${gitState.remoteUrl}`);
            addLine('success', `   ${gitState.branch} -> ${gitState.branch}`);
            addLine('success', '\n✅ Push completed successfully!');
            break;

          case 'pull':
            if (!gitState.initialized) { addLine('error', 'fatal: not a git repository'); break; }
            addLine('output', 'Already up to date.');
            break;

          case 'clone': {
            const url = args[1];
            if (!url) { addLine('error', 'usage: git clone <url>'); break; }
            addLine('info', `Cloning into '${url.split('/').pop()?.replace('.git', '')}'...`);
            addLine('output', 'remote: Enumerating objects: 142, done.');
            addLine('output', 'remote: Counting objects: 100% (142/142), done.');
            addLine('success', 'Clone completed (simulated).');
            break;
          }

          case 'diff':
            addLine('output', '(no changes detected)');
            break;

          default:
            addLine('error', `git: '${subCmd}' is not a git command. See 'git help'.`);
        }
        break;
      }

      default:
        addLine('error', `bash: ${command}: command not found`);
        addLine('info', 'Type "help" for available commands.');
    }
  }, [addLine, cwd, files, gitState, history, installedPackages, getCurrentDir, getCurrentDirNode, onCreateProject, onCreateFile, resolvePath, resolveNode]);

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
        if (idx >= history.length) { setHistoryIdx(-1); setInput(''); }
        else { setHistoryIdx(idx); setInput(history[idx]); }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Autocomplete file/folder names
      const parts = input.split(' ');
      const last = parts[parts.length - 1];
      if (last) {
        const items = getCurrentDir();
        const match = items.find(n => n.name.startsWith(last));
        if (match) {
          parts[parts.length - 1] = match.name;
          setInput(parts.join(' '));
        }
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (runningProcess) {
        addLine('warning', `\n^C Process "${runningProcess}" terminated.`);
        setRunningProcess(null);
      }
      setInput('');
    }
  };

  const colorMap: Record<TerminalLine['type'], string> = {
    input: 'text-muted-foreground',
    output: 'text-foreground/90',
    error: 'text-destructive',
    success: 'text-green-400',
    info: 'text-primary',
    warning: 'text-yellow-400',
  };

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-sidebar-border">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Terminal</span>
          {runningProcess && (
            <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 rounded ml-2">
              ● {runningProcess}
            </span>
          )}
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
          <span className="text-green-400 shrink-0">{cwd} $</span>
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
