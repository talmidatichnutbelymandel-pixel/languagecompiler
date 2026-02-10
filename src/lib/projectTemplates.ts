import { FileNode } from '@/types/ide';

let templateCounter = 900;
const genId = () => `tpl-${++templateCounter}-${Date.now()}`;

export interface ProjectTemplate {
  name: string;
  description: string;
  framework: string;
  create: (projectName: string) => FileNode;
}

const REACT_TEMPLATE = (projectName: string): FileNode => ({
  id: genId(),
  name: projectName,
  type: 'folder',
  children: [
    {
      id: genId(),
      name: 'index.html',
      type: 'file',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
    .app { text-align: center; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .counter { margin: 2rem 0; }
    .counter button { padding: 0.75rem 1.5rem; font-size: 1rem; border: none; border-radius: 0.5rem; background: #3b82f6; color: white; cursor: pointer; margin: 0 0.5rem; transition: background 0.2s; }
    .counter button:hover { background: #2563eb; }
    .count { font-size: 3rem; font-weight: bold; margin: 1rem 0; color: #60a5fa; }
    .todo-input { padding: 0.5rem 1rem; font-size: 1rem; border: 1px solid #334155; border-radius: 0.5rem; background: #1e293b; color: #e2e8f0; margin-right: 0.5rem; }
    .todo-list { list-style: none; margin-top: 1rem; text-align: left; max-width: 400px; margin-left: auto; margin-right: auto; }
    .todo-list li { padding: 0.5rem; margin: 0.25rem 0; background: #1e293b; border-radius: 0.375rem; display: flex; justify-content: space-between; }
    .todo-list li button { background: #ef4444; border: none; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; cursor: pointer; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    const { useState } = React;

    function App() {
      const [count, setCount] = useState(0);
      const [todos, setTodos] = useState([]);
      const [input, setInput] = useState('');

      const addTodo = () => {
        if (input.trim()) {
          setTodos([...todos, { id: Date.now(), text: input }]);
          setInput('');
        }
      };

      return (
        <div className="app">
          <h1>⚛️ ${projectName}</h1>
          <p>React App running in CodeCloud IDE</p>

          <div className="counter">
            <button onClick={() => setCount(c => c - 1)}>−</button>
            <div className="count">{count}</div>
            <button onClick={() => setCount(c => c + 1)}>+</button>
          </div>

          <div>
            <input
              className="todo-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Add a todo..."
            />
            <button className="counter" style={{display:'inline'}} onClick={addTodo}>
              <button>Add</button>
            </button>
          </div>
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id}>
                {todo.text}
                <button onClick={() => setTodos(todos.filter(t => t.id !== todo.id))}>✕</button>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`,
    },
    {
      id: genId(),
      name: 'App.jsx',
      type: 'file',
      language: 'javascript',
      content: `// React Component Example
// Note: This file is for reference. The app runs from index.html with CDN React.

function App() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="app">
      <h1>Hello React!</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}
`,
    },
    {
      id: genId(),
      name: 'styles.css',
      type: 'file',
      language: 'css',
      content: `/* Custom styles for ${projectName} */
.app {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  color: #61dafb;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  border-radius: 0.5rem;
  background: #61dafb;
  color: #282c34;
  cursor: pointer;
}
`,
    },
    {
      id: genId(),
      name: 'README.md',
      type: 'file',
      language: 'plaintext',
      content: `# ${projectName}

React project created with CodeCloud IDE.

## How to preview
Open \`index.html\` and click the Preview button (monitor icon) to see the live app.

## Structure
- \`index.html\` - Main entry with React CDN (open this for preview)
- \`App.jsx\` - Component reference
- \`styles.css\` - Custom styles
`,
    },
  ],
});

const ANGULAR_TEMPLATE = (projectName: string): FileNode => ({
  id: genId(),
  name: projectName,
  type: 'folder',
  children: [
    {
      id: genId(),
      name: 'index.html',
      type: 'file',
      language: 'html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${projectName}</title>
  <script src="https://unpkg.com/zone.js@0.14.2/dist/zone.min.js"></script>
  <script src="https://unpkg.com/@angular/compiler@17.3.0/bundles/compiler.umd.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
    .app { text-align: center; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #dd0031; }
    .angular-logo { font-size: 4rem; margin-bottom: 1rem; }
    .counter { margin: 2rem 0; }
    .counter button { padding: 0.75rem 1.5rem; font-size: 1rem; border: none; border-radius: 0.5rem; background: #dd0031; color: white; cursor: pointer; margin: 0 0.5rem; transition: transform 0.1s; }
    .counter button:hover { transform: scale(1.05); }
    .count { font-size: 3rem; font-weight: bold; margin: 1rem 0; color: #dd0031; }
    .card { background: #16213e; padding: 1.5rem; border-radius: 1rem; margin-top: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; }
    .input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
    .input-group input { flex: 1; padding: 0.5rem 1rem; border: 1px solid #334155; border-radius: 0.5rem; background: #0f3460; color: #eee; font-size: 1rem; }
    .items { list-style: none; text-align: left; }
    .items li { padding: 0.75rem; margin: 0.25rem 0; background: #0f3460; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
    .items li button { background: #e94560; border: none; color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem; cursor: pointer; }
    .subtitle { color: #a0a0b0; margin-bottom: 0.5rem; }
  </style>
</head>
<body>
  <div class="app">
    <div class="angular-logo">🅰️</div>
    <h1>${projectName}</h1>
    <p class="subtitle">Angular App running in CodeCloud IDE</p>

    <div class="counter">
      <button id="dec" onclick="decrement()">−</button>
      <div class="count" id="count">0</div>
      <button id="inc" onclick="increment()">+</button>
    </div>

    <div class="card">
      <h3 style="margin-bottom: 1rem;">📝 Todo List</h3>
      <div class="input-group">
        <input type="text" id="todoInput" placeholder="Add a task..." onkeydown="if(event.key==='Enter')addItem()" />
        <button style="padding:0.5rem 1rem;border:none;border-radius:0.5rem;background:#dd0031;color:white;cursor:pointer;" onclick="addItem()">Add</button>
      </div>
      <ul class="items" id="todoList"></ul>
    </div>
  </div>

  <script>
    // Simple Angular-style component logic
    let count = 0;
    let todos = [];

    function increment() {
      count++;
      document.getElementById('count').textContent = count;
    }

    function decrement() {
      count--;
      document.getElementById('count').textContent = count;
    }

    function addItem() {
      const input = document.getElementById('todoInput');
      const text = input.value.trim();
      if (!text) return;
      todos.push({ id: Date.now(), text });
      input.value = '';
      renderTodos();
    }

    function removeItem(id) {
      todos = todos.filter(t => t.id !== id);
      renderTodos();
    }

    function renderTodos() {
      const list = document.getElementById('todoList');
      list.innerHTML = todos.map(t =>
        '<li>' + t.text + ' <button onclick="removeItem(' + t.id + ')">✕</button></li>'
      ).join('');
    }
  </script>
</body>
</html>`,
    },
    {
      id: genId(),
      name: 'app.component.ts',
      type: 'file',
      language: 'typescript',
      content: `// Angular Component Reference
// Note: This project uses vanilla JS in index.html to simulate Angular behavior
// Open index.html and use Preview to see the running app

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div class="app">
      <h1>{{ title }}</h1>
      <button (click)="count = count + 1">Count: {{ count }}</button>
    </div>
  \`
})
export class AppComponent {
  title = '${projectName}';
  count = 0;
}
`,
    },
    {
      id: genId(),
      name: 'styles.css',
      type: 'file',
      language: 'css',
      content: `/* Custom styles for ${projectName} */
:root {
  --angular-red: #dd0031;
  --angular-dark: #1a1a2e;
}

.app {
  text-align: center;
  padding: 2rem;
}

h1 {
  color: var(--angular-red);
}
`,
    },
    {
      id: genId(),
      name: 'README.md',
      type: 'file',
      language: 'plaintext',
      content: `# ${projectName}

Angular-style project created with CodeCloud IDE.

## How to preview
Open \`index.html\` and click the Preview button (monitor icon) to see the live app.

## Structure
- \`index.html\` - Main entry with live preview (open this for preview)
- \`app.component.ts\` - Angular component reference
- \`styles.css\` - Custom styles
`,
    },
  ],
});

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    name: 'React App',
    description: 'React app with hooks, counter & todo list',
    framework: 'react',
    create: REACT_TEMPLATE,
  },
  {
    name: 'Angular App',
    description: 'Angular-style app with counter & todo list',
    framework: 'angular',
    create: ANGULAR_TEMPLATE,
  },
];

export function getTemplateByFramework(framework: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find(t => t.framework === framework.toLowerCase());
}
