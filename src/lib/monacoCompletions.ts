import type { Monaco } from '@monaco-editor/react';

const pythonKeywords = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break',
  'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
  'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
  'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield',
];
const pythonBuiltins = [
  'print', 'input', 'len', 'range', 'int', 'str', 'float', 'list', 'dict',
  'set', 'tuple', 'bool', 'type', 'isinstance', 'issubclass', 'abs', 'all',
  'any', 'bin', 'chr', 'dir', 'divmod', 'enumerate', 'eval', 'exec',
  'filter', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash',
  'hex', 'id', 'iter', 'map', 'max', 'min', 'next', 'object', 'oct',
  'open', 'ord', 'pow', 'property', 'repr', 'reversed', 'round', 'setattr',
  'slice', 'sorted', 'staticmethod', 'sum', 'super', 'vars', 'zip',
  'ValueError', 'TypeError', 'KeyError', 'IndexError', 'AttributeError',
  'ImportError', 'FileNotFoundError', 'RuntimeError', 'StopIteration',
  'Exception', 'BaseException', 'OSError', 'IOError',
];

const javaKeywords = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
  'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
  'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
  'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
  'package', 'private', 'protected', 'public', 'return', 'short', 'static',
  'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
  'transient', 'try', 'void', 'volatile', 'while',
  'System.out.println', 'System.out.print', 'System.err.println',
  'String', 'Integer', 'Double', 'Float', 'Boolean', 'Character', 'Long',
  'ArrayList', 'HashMap', 'HashSet', 'LinkedList', 'Scanner', 'Arrays',
  'Collections', 'Math', 'StringBuilder', 'StringBuffer', 'Object',
];

const csharpKeywords = [
  'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char',
  'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate',
  'do', 'double', 'else', 'enum', 'event', 'explicit', 'extern', 'false',
  'finally', 'fixed', 'float', 'for', 'foreach', 'goto', 'if', 'implicit',
  'in', 'int', 'interface', 'internal', 'is', 'lock', 'long', 'namespace',
  'new', 'null', 'object', 'operator', 'out', 'override', 'params', 'private',
  'protected', 'public', 'readonly', 'ref', 'return', 'sbyte', 'sealed',
  'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch',
  'this', 'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked',
  'unsafe', 'ushort', 'using', 'var', 'virtual', 'void', 'volatile', 'while',
  'Console.WriteLine', 'Console.ReadLine', 'Console.Write',
  'List', 'Dictionary', 'HashSet', 'Queue', 'Stack', 'StringBuilder',
  'Task', 'async', 'await', 'LINQ', 'IEnumerable',
];

const htmlTags = [
  'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
  'thead', 'tbody', 'tfoot', 'form', 'input', 'button', 'select', 'option',
  'textarea', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer',
  'nav', 'main', 'section', 'article', 'aside', 'figure', 'figcaption',
  'video', 'audio', 'source', 'canvas', 'svg', 'iframe', 'script', 'style',
  'link', 'meta', 'title', 'head', 'body', 'html', 'br', 'hr', 'pre', 'code',
  'strong', 'em', 'blockquote', 'details', 'summary', 'dialog',
];

const cssProperties = [
  'color', 'background', 'background-color', 'background-image', 'border',
  'border-radius', 'margin', 'padding', 'width', 'height', 'display',
  'position', 'top', 'right', 'bottom', 'left', 'flex', 'flex-direction',
  'justify-content', 'align-items', 'gap', 'grid', 'grid-template-columns',
  'grid-template-rows', 'font-size', 'font-family', 'font-weight', 'line-height',
  'text-align', 'text-decoration', 'text-transform', 'overflow', 'opacity',
  'z-index', 'box-shadow', 'transition', 'transform', 'animation',
  'cursor', 'visibility', 'max-width', 'min-width', 'max-height', 'min-height',
  'object-fit', 'white-space', 'word-wrap', 'letter-spacing',
];

function createSuggestions(
  monaco: Monaco,
  words: string[],
  kind: number,
  range: any,
) {
  return words.map(w => ({
    label: w,
    kind,
    insertText: w,
    range,
  }));
}

export function registerCompletionProviders(monaco: Monaco) {
  // Python
  monaco.languages.registerCompletionItemProvider('python', {
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: position.column,
      };
      return {
        suggestions: [
          ...createSuggestions(monaco, pythonKeywords, monaco.languages.CompletionItemKind.Keyword, range),
          ...createSuggestions(monaco, pythonBuiltins, monaco.languages.CompletionItemKind.Function, range),
        ],
      };
    },
  });

  // Java
  monaco.languages.registerCompletionItemProvider('java', {
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: position.column,
      };
      return {
        suggestions: createSuggestions(monaco, javaKeywords, monaco.languages.CompletionItemKind.Keyword, range),
      };
    },
  });

  // C#
  monaco.languages.registerCompletionItemProvider('csharp', {
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: position.column,
      };
      return {
        suggestions: createSuggestions(monaco, csharpKeywords, monaco.languages.CompletionItemKind.Keyword, range),
      };
    },
  });

  // HTML
  monaco.languages.registerCompletionItemProvider('html', {
    triggerCharacters: ['<'],
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: position.column,
      };
      return {
        suggestions: htmlTags.map(tag => ({
          label: tag,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: `${tag}>$0</${tag}>`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
        })),
      };
    },
  });

  // CSS
  monaco.languages.registerCompletionItemProvider('css', {
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: position.column,
      };
      return {
        suggestions: cssProperties.map(prop => ({
          label: prop,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: `${prop}: `,
          range,
        })),
      };
    },
  });
}
