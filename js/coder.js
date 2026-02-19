/**
 * coder.js - Advanced Code Editor with Full Integration
 * Handles file management, editor operations, and terminal commands
 */

// ==================== STATE MANAGEMENT ====================
let editor = null;
let currentFile = 'index.html';
let files = {};
let activeFiles = [];
let fileHistory = [];
let autoSaveTimer = null;
let terminalHistory = [];
let commandHistory = [];
let historyIndex = -1;

// File templates
const FILE_TEMPLATES = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello, amkyaw.dev!</h1>
    <script src="script.js"></script>
</body>
</html>`,
    
    css: `/* CSS Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

h1 {
    font-size: 3rem;
    animation: fadeIn 2s;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}`,
    
    js: `// JavaScript Code
console.log('Welcome to amkyaw.dev!');

document.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('h1');
    if (h1) {
        h1.addEventListener('click', () => {
            alert('Hello from amkyaw.dev!');
        });
    }
});`,
    
    py: `# Python Code
def main():
    print("Hello from amkyaw.dev!")
    
if __name__ == "__main__":
    main()`,
    
    json: `{
    "name": "my-project",
    "version": "1.0.0",
    "description": "A project on amkyaw.dev",
    "dependencies": {}
}`,
    
    md: `# My Project

## Description
This is a project created on amkyaw.dev

## Features
- Code editing
- Live preview
- AI assistance
- Cloud sync
`
};

// File icons mapping
const FILE_ICONS = {
    html: 'fa-html5',
    htm: 'fa-html5',
    css: 'fa-css3-alt',
    js: 'fa-js',
    jsx: 'fa-react',
    ts: 'fa-code',
    tsx: 'fa-code',
    py: 'fa-python',
    json: 'fa-file-code',
    md: 'fa-markdown',
    txt: 'fa-file-alt',
    xml: 'fa-code',
    svg: 'fa-code-branch',
    default: 'fa-file'
};

// Language modes for CodeMirror
const LANGUAGE_MODES = {
    html: 'htmlmixed',
    htm: 'htmlmixed',
    css: 'css',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'javascript',
    tsx: 'javascript',
    py: 'python',
    json: 'javascript',
    md: 'markdown',
    xml: 'xml',
    default: 'javascript'
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    initializeEditor();
    setupAutoSave();
    setupTerminal();
    loadFromStorage();
    setupEventListeners();
});

function loadInitialData() {
    // Load from localStorage or create default files
    const saved = localStorage.getItem('coder_files');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            files = data.files || {};
            activeFiles = data.activeFiles || [];
            currentFile = data.currentFile || 'index.html';
        } catch (e) {
            createDefaultFiles();
        }
    } else {
        createDefaultFiles();
    }
}

function createDefaultFiles() {
    files = {
        'index.html': {
            content: FILE_TEMPLATES.html,
            language: 'htmlmixed',
            icon: 'fa-html5'
        },
        'style.css': {
            content: FILE_TEMPLATES.css,
            language: 'css',
            icon: 'fa-css3-alt'
        },
        'script.js': {
            content: FILE_TEMPLATES.js,
            language: 'javascript',
            icon: 'fa-js'
        }
    };
    activeFiles = ['index.html', 'style.css', 'script.js'];
    currentFile = 'index.html';
}

function initializeEditor() {
    const editorElement = document.getElementById('code-editor');
    if (!editorElement) return;

    editor = CodeMirror(editorElement, {
        value: files[currentFile]?.content || '',
        mode: files[currentFile]?.language || 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: {
            'Ctrl-S': () => saveCurrentFile(),
            'Ctrl-R': () => runCode(),
            'Ctrl-F': 'findPersistent',
            'Ctrl-H': 'replace',
            'Ctrl-/': 'toggleComment',
            'Ctrl-D': (cm) => deleteLine(cm),
            'Ctrl-Shift-D': (cm) => duplicateLine(cm),
            'Alt-Up': (cm) => swapLine(cm, 'up'),
            'Alt-Down': (cm) => swapLine(cm, 'down'),
            'Ctrl-Enter': () => runCode(),
            'F1': () => showHelp()
        }
    });

    // Editor change handler
    editor.on('change', () => {
        if (currentFile && files[currentFile]) {
            files[currentFile].content = editor.getValue();
        }
    });

    // Load UI
    loadFileTree();
    loadEditorTabs();
}

// ==================== FILE MANAGEMENT ====================
function loadFileTree() {
    const tree = document.getElementById('fileTree');
    if (!tree) return;

    tree.innerHTML = '';
    
    Object.keys(files).sort().forEach(filename => {
        const file = files[filename];
        const ext = filename.split('.').pop();
        const icon = FILE_ICONS[ext] || FILE_ICONS.default;
        
        const item = document.createElement('div');
        item.className = `file-item ${filename === currentFile ? 'active' : ''}`;
        item.dataset.filename = filename;
        item.onclick = () => openFile(filename);
        
        item.innerHTML = `
            <i class="fas ${icon} file-icon ${ext}"></i>
            <span>${filename}</span>
            <div class="file-actions">
                <i class="fas fa-edit" onclick="event.stopPropagation(); renameFile('${filename}')" title="Rename"></i>
                <i class="fas fa-trash" onclick="event.stopPropagation(); deleteFile('${filename}')" title="Delete"></i>
            </div>
        `;
        
        tree.appendChild(item);
    });
}

function loadEditorTabs() {
    const tabs = document.getElementById('editorTabs');
    if (!tabs) return;

    // Remove all tabs except new tab button
    const newTabBtn = tabs.querySelector('.new-tab-btn');
    tabs.innerHTML = '';
    
    activeFiles.forEach(filename => {
        if (!files[filename]) return;
        
        const file = files[filename];
        const ext = filename.split('.').pop();
        const icon = FILE_ICONS[ext] || FILE_ICONS.default;
        
        const tab = document.createElement('div');
        tab.className = `editor-tab ${filename === currentFile ? 'active' : ''}`;
        tab.dataset.filename = filename;
        tab.onclick = () => openFile(filename);
        
        tab.innerHTML = `
            <i class="fas ${icon} file-icon ${ext}"></i>
            <span>${filename}</span>
            <i class="fas fa-times close-tab" onclick="event.stopPropagation(); closeFile('${filename}')" title="Close"></i>
        `;
        
        tabs.appendChild(tab);
    });
    
    // Restore new tab button
    if (newTabBtn) {
        tabs.appendChild(newTabBtn);
    }
}

function openFile(filename) {
    if (!files[filename]) return;
    
    currentFile = filename;
    const file = files[filename];
    
    editor.setValue(file.content);
    editor.setOption('mode', file.language);
    
    if (!activeFiles.includes(filename)) {
        activeFiles.push(filename);
    }
    
    updateActiveStates();
    loadEditorTabs();
    addToHistory(`Opened ${filename}`);
}

function saveCurrentFile() {
    if (currentFile && files[currentFile]) {
        files[currentFile].content = editor.getValue();
        saveToStorage();
        showNotification(`✅ ${currentFile} saved`, 'success');
        addToHistory(`Saved ${currentFile}`);
    }
}

function saveAllFiles() {
    if (currentFile) {
        files[currentFile].content = editor.getValue();
    }
    saveToStorage();
    showNotification('✅ All files saved', 'success');
}

function createFile() {
    const filename = prompt('Enter file name (with extension):', 'newfile.js');
    if (!filename) return;
    
    if (files[filename]) {
        showNotification('❌ File already exists', 'error');
        return;
    }
    
    const ext = filename.split('.').pop().toLowerCase();
    const language = LANGUAGE_MODES[ext] || LANGUAGE_MODES.default;
    const icon = FILE_ICONS[ext] || FILE_ICONS.default;
    const content = FILE_TEMPLATES[ext] || '';
    
    files[filename] = {
        content,
        language,
        icon
    };
    
    activeFiles.push(filename);
    
    loadFileTree();
    loadEditorTabs();
    openFile(filename);
    saveToStorage();
    
    showNotification(`✅ ${filename} created`, 'success');
    addToHistory(`Created ${filename}`);
}

function deleteFile(filename) {
    if (!confirm(`Delete ${filename}?`)) return;
    
    delete files[filename];
    
    const index = activeFiles.indexOf(filename);
    if (index > -1) activeFiles.splice(index, 1);
    
    if (filename === currentFile) {
        if (activeFiles.length > 0) {
            openFile(activeFiles[0]);
        } else {
            createDefaultFiles();
            loadFileTree();
            loadEditorTabs();
            openFile('index.html');
        }
    }
    
    loadFileTree();
    loadEditorTabs();
    saveToStorage();
    
    showNotification(`✅ ${filename} deleted`, 'success');
    addToHistory(`Deleted ${filename}`);
}

function renameFile(oldName) {
    const newName = prompt('Enter new filename:', oldName);
    if (!newName || newName === oldName) return;
    
    if (files[newName]) {
        showNotification('❌ File already exists', 'error');
        return;
    }
    
    files[newName] = files[oldName];
    delete files[oldName];
    
    const index = activeFiles.indexOf(oldName);
    if (index > -1) activeFiles[index] = newName;
    
    if (currentFile === oldName) {
        currentFile = newName;
    }
    
    loadFileTree();
    loadEditorTabs();
    saveToStorage();
    
    showNotification(`✅ Renamed to ${newName}`, 'success');
    addToHistory(`Renamed ${oldName} → ${newName}`);
}

function closeFile(filename) {
    if (activeFiles.length <= 1) {
        showNotification('Cannot close the last file', 'error');
        return;
    }
    
    const index = activeFiles.indexOf(filename);
    if (index > -1) {
        activeFiles.splice(index, 1);
    }
    
    if (filename === currentFile && activeFiles.length > 0) {
        openFile(activeFiles[0]);
    }
    
    loadEditorTabs();
}

function refreshFiles() {
    loadFileTree();
    loadEditorTabs();
    showNotification('🔄 Files refreshed', 'info');
}

function updateActiveStates() {
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.filename === currentFile) {
            item.classList.add('active');
        }
    });
}

// ==================== CODE EXECUTION ====================
function runCode() {
    saveCurrentFile();
    
    const previewFrame = document.getElementById('previewFrame');
    if (!previewFrame) return;
    
    const htmlFile = files['index.html'] || { content: '' };
    const cssFile = files['style.css'] || { content: '' };
    const jsFile = files['script.js'] || { content: '' };
    
    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>${cssFile.content}</style>
        </head>
        <body>
            ${htmlFile.content}
            <script>${jsFile.content}<\/script>
        </body>
        </html>
    `;
    
    previewFrame.srcdoc = fullHtml;
    
    showNotification('🚀 Code running...', 'success');
    addToTerminal('> Program executed', 'success');
}

// ==================== TERMINAL ====================
function setupTerminal() {
    const terminalInput = document.getElementById('terminalInput');
    if (!terminalInput) return;
    
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = e.target.value.trim();
            if (command) {
                processTerminalCommand(command);
                e.target.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateHistory(-1);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateHistory(1);
        } else if (e.key === 'Tab') {
            e.preventDefault();
            autocompleteCommand(e.target.value);
        }
    });
}

function processTerminalCommand(command) {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    
    // Add to history
    commandHistory.push(command);
    historyIndex = commandHistory.length;
    
    // Display command
    addToTerminal(`$ ${command}`, 'input');
    
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Command handlers
    const commands = {
        help: () => {
            addToTerminal('Available commands:', 'system');
            addToTerminal('  help          - Show this help', 'system');
            addToTerminal('  ls            - List files', 'system');
            addToTerminal('  cat [file]    - View file content', 'system');
            addToTerminal('  run           - Run current project', 'system');
            addToTerminal('  clear         - Clear terminal', 'system');
            addToTerminal('  open [file]   - Open file in editor', 'system');
            addToTerminal('  save          - Save current file', 'system');
            addToTerminal('  history       - Show command history', 'system');
            addToTerminal('  tree          - Show file tree', 'system');
        },
        
        ls: () => {
            addToTerminal(Object.keys(files).join('  '));
        },
        
        cat: () => {
            if (args[0] && files[args[0]]) {
                addToTerminal(files[args[0]].content, 'output');
            } else {
                addToTerminal(`File not found: ${args[0] || ''}`, 'error');
            }
        },
        
        run: () => {
            runCode();
            addToTerminal('Running project...', 'success');
        },
        
        clear: () => {
            output.innerHTML = '';
        },
        
        open: () => {
            if (args[0] && files[args[0]]) {
                openFile(args[0]);
                addToTerminal(`Opened: ${args[0]}`, 'success');
            } else {
                addToTerminal(`File not found: ${args[0] || ''}`, 'error');
            }
        },
        
        save: () => {
            saveCurrentFile();
            addToTerminal('File saved', 'success');
        },
        
        history: () => {
            commandHistory.forEach((cmd, i) => {
                addToTerminal(`  ${i + 1}  ${cmd}`);
            });
        },
        
        tree: () => {
            addToTerminal('File Tree:');
            Object.keys(files).forEach(f => {
                addToTerminal(`  📄 ${f}`);
            });
        }
    };
    
    if (commands[cmd]) {
        commands[cmd]();
    } else {
        addToTerminal(`Command not found: ${cmd}`, 'error');
    }
    
    output.scrollTop = output.scrollHeight;
}

function addToTerminal(text, type = 'normal') {
    const output = document.getElementById('terminalOutput');
    if (!output) return;
    
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function navigateHistory(direction) {
    const input = document.getElementById('terminalInput');
    if (!input) return;
    
    historyIndex += direction;
    
    if (historyIndex < 0) {
        historyIndex = 0;
    } else if (historyIndex >= commandHistory.length) {
        historyIndex = commandHistory.length;
        input.value = '';
        return;
    }
    
    if (commandHistory[historyIndex]) {
        input.value = commandHistory[historyIndex];
    }
}

function autocompleteCommand(input) {
    const commands = ['help', 'ls', 'cat', 'run', 'clear', 'open', 'save', 'history', 'tree'];
    const match = commands.find(cmd => cmd.startsWith(input));
    if (match) {
        document.getElementById('terminalInput').value = match;
    }
}

// ==================== UTILITIES ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-5 right-5 px-6 py-3 bg-black/80 backdrop-blur rounded-full text-white text-sm z-50 transition-all duration-300 border-l-4 ${
        type === 'success' ? 'border-green-500' : 
        type === 'error' ? 'border-red-500' : 
        'border-blue-500'
    }`;
    notification.textContent = message;
    notification.style.transform = 'translateY(0)';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function addToHistory(action) {
    fileHistory.push({
        action,
        file: currentFile,
        time: new Date().toISOString()
    });
    
    if (fileHistory.length > 50) {
        fileHistory.shift();
    }
}

function saveToStorage() {
    localStorage.setItem('coder_files', JSON.stringify({
        files,
        activeFiles,
        currentFile
    }));
}

function loadFromStorage() {
    // Load terminal history
    const savedHistory = localStorage.getItem('terminal_history');
    if (savedHistory) {
        try {
            commandHistory = JSON.parse(savedHistory);
            historyIndex = commandHistory.length;
        } catch (e) {}
    }
}

function setupAutoSave() {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
        if (currentFile && files[currentFile]) {
            files[currentFile].content = editor.getValue();
            saveToStorage();
        }
    }, 30000);
}

function setupEventListeners() {
    // Before unload
    window.addEventListener('beforeunload', () => {
        saveToStorage();
        localStorage.setItem('terminal_history', JSON.stringify(commandHistory.slice(-100)));
    });
}

// ==================== EDITOR UTILITIES ====================
function deleteLine(cm) {
    const cursor = cm.getCursor();
    cm.replaceRange('', { line: cursor.line, ch: 0 }, { line: cursor.line + 1, ch: 0 });
}

function duplicateLine(cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    cm.replaceRange(line + '\n' + line, { line: cursor.line, ch: 0 });
    cm.setCursor({ line: cursor.line + 1, ch: cursor.ch });
}

function swapLine(cm, direction) {
    const cursor = cm.getCursor();
    const lineCount = cm.lineCount();
    
    if (direction === 'up' && cursor.line > 0) {
        const currentLine = cm.getLine(cursor.line);
        const prevLine = cm.getLine(cursor.line - 1);
        cm.replaceRange(prevLine + '\n' + currentLine, 
            { line: cursor.line - 1, ch: 0 }, 
            { line: cursor.line + 1, ch: 0 });
        cm.setCursor({ line: cursor.line - 1, ch: cursor.ch });
    } else if (direction === 'down' && cursor.line < lineCount - 1) {
        const currentLine = cm.getLine(cursor.line);
        const nextLine = cm.getLine(cursor.line + 1);
        cm.replaceRange(currentLine + '\n' + nextLine, 
            { line: cursor.line, ch: 0 }, 
            { line: cursor.line + 2, ch: 0 });
        cm.setCursor({ line: cursor.line + 1, ch: cursor.ch });
    }
}

function showHelp() {
    showNotification('Press F1 for help - See shortcuts in menu', 'info');
}

// ==================== AI INTEGRATION ====================
function createFileFromCode(code) {
    let filename = 'ai-generated.js';
    let ext = 'js';
    let language = 'javascript';
    
    if (code.includes('<!DOCTYPE html') || code.includes('<html')) {
        filename = 'ai-generated.html';
        ext = 'html';
        language = 'htmlmixed';
    } else if (code.includes('{') && code.includes('}') && code.includes(':')) {
        filename = 'ai-generated.css';
        ext = 'css';
        language = 'css';
    } else if (code.includes('def ') || code.includes('import ')) {
        filename = 'ai-generated.py';
        ext = 'py';
        language = 'python';
    }
    
    // Ensure unique filename
    let counter = 1;
    while (files[filename]) {
        filename = `ai-generated-${counter}.${ext}`;
        counter++;
    }
    
    files[filename] = {
        content: code,
        language,
        icon: FILE_ICONS[ext] || FILE_ICONS.default
    };
    
    activeFiles.push(filename);
    loadFileTree();
    loadEditorTabs();
    openFile(filename);
    runCode();
    
    showNotification(`✨ Generated ${filename} from AI`, 'success');
}

// ==================== EXPORTS ====================
window.createFile = createFile;
window.createFolder = () => showNotification('📁 Folders coming soon!', 'info');
window.refreshFiles = refreshFiles;
window.runCode = runCode;
window.saveCurrentFile = saveCurrentFile;
window.saveAllFiles = saveAllFiles;
window.createFileFromCode = createFileFromCode;
window.closeFile = closeFile;
window.renameFile = renameFile;
window.deleteFile = deleteFile;
window.openFile = openFile;