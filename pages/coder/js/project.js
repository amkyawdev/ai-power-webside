/**
 * project.js - Advanced Project Management System
 * Handles project creation, file management, and Google Drive integration
 */

class ProjectManager {
    constructor() {
        this.currentProject = null;
        this.projects = [];
        this.files = {};
        this.autoSaveInterval = null;
        this.driveAPI = null;
        this.init();
    }

    async init() {
        await this.loadProjects();
        this.setupAutoSave();
        this.initGoogleDrive();
        this.setupEventListeners();
    }

    // Load projects from localStorage
    loadProjects() {
        const saved = localStorage.getItem('projects');
        if (saved) {
            try {
                this.projects = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load projects:', e);
                this.projects = [];
            }
        } else {
            // Create default project
            this.createDefaultProject();
        }
    }

    // Create default project
    createDefaultProject() {
        const defaultProject = {
            id: 'project_' + Date.now(),
            name: 'My First Project',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            files: {
                'index.html': {
                    content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <h1>Hello World</h1>\n    <script src="script.js"></script>\n</body>\n</html>',
                    language: 'htmlmixed',
                    lastModified: new Date().toISOString()
                },
                'style.css': {
                    content: 'body {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: linear-gradient(135deg, #667eea, #764ba2);\n    color: white;\n}',
                    language: 'css',
                    lastModified: new Date().toISOString()
                },
                'script.js': {
                    content: 'console.log("Hello World");\n\ndocument.addEventListener("DOMContentLoaded", function() {\n    const h1 = document.querySelector("h1");\n    h1.addEventListener("click", function() {\n        alert("Welcome to amkyaw.dev!");\n    });\n});',
                    language: 'javascript',
                    lastModified: new Date().toISOString()
                }
            }
        };
        
        this.projects.push(defaultProject);
        this.currentProject = defaultProject;
        this.saveProjects();
    }

    // Save projects to localStorage
    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    // Create new project
    createProject(name, template = 'empty') {
        const templates = {
            'empty': {
                'index.html': {
                    content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>New Project</title>\n</head>\n<body>\n    \n</body>\n</html>',
                    language: 'htmlmixed'
                }
            },
            'react': {
                'App.js': {
                    content: 'import React from "react";\n\nfunction App() {\n    return (\n        <div>\n            <h1>Hello React</h1>\n        </div>\n    );\n}\n\nexport default App;',
                    language: 'javascript'
                },
                'index.js': {
                    content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));',
                    language: 'javascript'
                }
            },
            'vue': {
                'App.vue': {
                    content: '<template>\n    <div id="app">\n        <h1>{{ message }}</h1>\n    </div>\n</template>\n\n<script>\nexport default {\n    data() {\n        return {\n            message: "Hello Vue!"\n        };\n    }\n};\n</script>\n\n<style>\n#app {\n    font-family: Arial, sans-serif;\n    text-align: center;\n    color: #2c3e50;\n}\n</style>',
                    language: 'htmlmixed'
                }
            },
            'node': {
                'index.js': {
                    content: 'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n    res.send("Hello World");\n});\n\napp.listen(3000, () => {\n    console.log("Server running on port 3000");\n});',
                    language: 'javascript'
                },
                'package.json': {
                    content: '{\n    "name": "my-project",\n    "version": "1.0.0",\n    "dependencies": {\n        "express": "^4.18.0"\n    }\n}',
                    language: 'json'
                }
            }
        };

        const project = {
            id: 'project_' + Date.now(),
            name: name || 'Untitled Project',
            template: template,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            files: templates[template] || templates.empty
        };

        this.projects.push(project);
        this.currentProject = project;
        this.saveProjects();
        
        this.dispatchEvent('project-created', project);
        return project;
    }

    // Open project
    openProject(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (project) {
            this.currentProject = project;
            this.dispatchEvent('project-opened', project);
            return project;
        }
        return null;
    }

    // Save current project
    saveCurrentProject() {
        if (this.currentProject) {
            this.currentProject.lastModified = new Date().toISOString();
            this.saveProjects();
            this.dispatchEvent('project-saved', this.currentProject);
        }
    }

    // Delete project
    deleteProject(projectId) {
        const index = this.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            const project = this.projects[index];
            this.projects.splice(index, 1);
            this.saveProjects();
            this.dispatchEvent('project-deleted', project);
            
            if (this.currentProject?.id === projectId) {
                this.currentProject = this.projects[0] || null;
            }
        }
    }

    // Create file in current project
    createFile(filename, content = '', language = 'javascript') {
        if (!this.currentProject) {
            throw new Error('No project open');
        }

        if (this.currentProject.files[filename]) {
            throw new Error('File already exists');
        }

        this.currentProject.files[filename] = {
            content: content,
            language: language,
            lastModified: new Date().toISOString()
        };

        this.saveCurrentProject();
        this.dispatchEvent('file-created', { filename, project: this.currentProject });
        
        return this.currentProject.files[filename];
    }

    // Update file
    updateFile(filename, content) {
        if (!this.currentProject?.files[filename]) {
            throw new Error('File not found');
        }

        this.currentProject.files[filename].content = content;
        this.currentProject.files[filename].lastModified = new Date().toISOString();
        
        this.saveCurrentProject();
        this.dispatchEvent('file-updated', { filename, project: this.currentProject });
    }

    // Delete file
    deleteFile(filename) {
        if (!this.currentProject?.files[filename]) {
            throw new Error('File not found');
        }

        delete this.currentProject.files[filename];
        this.saveCurrentProject();
        this.dispatchEvent('file-deleted', { filename, project: this.currentProject });
    }

    // Rename file
    renameFile(oldName, newName) {
        if (!this.currentProject?.files[oldName]) {
            throw new Error('File not found');
        }

        if (this.currentProject.files[newName]) {
            throw new Error('File already exists');
        }

        this.currentProject.files[newName] = this.currentProject.files[oldName];
        delete this.currentProject.files[oldName];
        
        this.saveCurrentProject();
        this.dispatchEvent('file-renamed', { oldName, newName, project: this.currentProject });
    }

    // Get file content
    getFile(filename) {
        return this.currentProject?.files[filename];
    }

    // Get all files in current project
    getAllFiles() {
        return this.currentProject?.files || {};
    }

    // Setup auto-save
    setupAutoSave(interval = 30000) {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            this.saveCurrentProject();
        }, interval);
    }

    // Initialize Google Drive API
    initGoogleDrive() {
        // Load Google Drive API
        gapi.load('client:auth2', () => {
            gapi.client.init({
                apiKey: 'YOUR_API_KEY',
                clientId: 'YOUR_CLIENT_ID',
                scope: 'https://www.googleapis.com/auth/drive.file'
            }).then(() => {
                this.driveAPI = gapi.client;
                console.log('Google Drive API ready');
            });
        });
    }

    // Export project to Google Drive
    async exportToDrive() {
        if (!this.currentProject) return;

        const content = JSON.stringify(this.currentProject);
        const blob = new Blob([content], { type: 'application/json' });
        
        const metadata = {
            name: `${this.currentProject.name}.amkyaw`,
            mimeType: 'application/json',
            parents: ['appDataFolder']
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        try {
            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + gapi.auth.getToken().access_token
                },
                body: form
            });

            const data = await response.json();
            this.dispatchEvent('drive-export-success', data);
            return data;
        } catch (error) {
            console.error('Export to Drive failed:', error);
            this.dispatchEvent('drive-export-error', error);
            throw error;
        }
    }

    // Import project from Google Drive
    async importFromDrive(fileId) {
        try {
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            const project = JSON.parse(response.body);
            this.projects.push(project);
            this.saveProjects();
            
            this.dispatchEvent('drive-import-success', project);
            return project;
        } catch (error) {
            console.error('Import from Drive failed:', error);
            this.dispatchEvent('drive-import-error', error);
            throw error;
        }
    }

    // List projects from Google Drive
    async listDriveProjects() {
        try {
            const response = await gapi.client.drive.files.list({
                q: "mimeType='application/json' and 'appDataFolder' in parents",
                fields: 'files(id, name, modifiedTime)'
            });

            return response.result.files;
        } catch (error) {
            console.error('List Drive projects failed:', error);
            return [];
        }
    }

    // Search projects
    searchProjects(query) {
        query = query.toLowerCase();
        return this.projects.filter(project => 
            project.name.toLowerCase().includes(query) ||
            Object.keys(project.files).some(file => file.toLowerCase().includes(query))
        );
    }

    // Get project statistics
    getProjectStats(projectId = null) {
        const project = projectId ? this.projects.find(p => p.id === projectId) : this.currentProject;
        
        if (!project) return null;

        const files = Object.values(project.files);
        let totalLines = 0;
        let totalSize = 0;

        files.forEach(file => {
            const lines = file.content.split('\n').length;
            totalLines += lines;
            totalSize += new Blob([file.content]).size;
        });

        return {
            fileCount: files.length,
            totalLines,
            totalSize,
            lastModified: project.lastModified,
            created: project.createdAt
        };
    }

    // Duplicate project
    duplicateProject(projectId) {
        const original = this.projects.find(p => p.id === projectId);
        if (!original) return null;

        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.id = 'project_' + Date.now();
        duplicate.name = original.name + ' (Copy)';
        duplicate.createdAt = new Date().toISOString();
        duplicate.lastModified = new Date().toISOString();

        this.projects.push(duplicate);
        this.saveProjects();
        
        this.dispatchEvent('project-duplicated', duplicate);
        return duplicate;
    }

    // Merge projects
    mergeProjects(sourceId, targetId) {
        const source = this.projects.find(p => p.id === sourceId);
        const target = this.projects.find(p => p.id === targetId);

        if (!source || !target) return false;

        // Merge files
        Object.assign(target.files, source.files);
        target.lastModified = new Date().toISOString();

        // Remove source
        this.deleteProject(sourceId);
        
        this.dispatchEvent('project-merged', { source, target });
        return true;
    }

    // Export project as zip
    async exportAsZip() {
        if (!this.currentProject) return;

        const JSZip = window.JSZip;
        if (!JSZip) {
            await this.loadJSZip();
        }

        const zip = new JSZip();
        
        Object.entries(this.currentProject.files).forEach(([name, file]) => {
            zip.file(name, file.content);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.currentProject.name}.zip`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        this.dispatchEvent('project-exported', this.currentProject);
    }

    // Load JSZip library dynamically
    loadJSZip() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for beforeunload to save
        window.addEventListener('beforeunload', () => {
            this.saveCurrentProject();
        });
    }

    // Dispatch custom events
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent('project-manager-' + eventName, { detail });
        document.dispatchEvent(event);
    }

    // Get file icon based on extension
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'html': 'fa-html5',
            'htm': 'fa-html5',
            'css': 'fa-css3-alt',
            'js': 'fa-js',
            'jsx': 'fa-react',
            'ts': 'fa-code',
            'tsx': 'fa-code',
            'json': 'fa-brackets-curly',
            'py': 'fa-python',
            'java': 'fa-java',
            'cpp': 'fa-cpp',
            'c': 'fa-c',
            'php': 'fa-php',
            'rb': 'fa-gem',
            'go': 'fa-code',
            'rs': 'fa-code',
            'swift': 'fa-swift',
            'kt': 'fa-code',
            'md': 'fa-markdown',
            'txt': 'fa-file-alt',
            'xml': 'fa-code',
            'svg': 'fa-code-branch',
            'png': 'fa-file-image',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'gif': 'fa-file-image',
            'mp4': 'fa-file-video',
            'mp3': 'fa-file-audio',
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'xls': 'fa-file-excel',
            'xlsx': 'fa-file-excel'
        };
        
        return icons[ext] || 'fa-file';
    }

    // Get language mode for CodeMirror
    getLanguageMode(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const modes = {
            'html': 'htmlmixed',
            'htm': 'htmlmixed',
            'css': 'css',
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'javascript',
            'tsx': 'javascript',
            'json': 'javascript',
            'py': 'python',
            'java': 'text/x-java',
            'cpp': 'text/x-c++src',
            'c': 'text/x-csrc',
            'php': 'php',
            'rb': 'ruby',
            'go': 'go',
            'rs': 'rust',
            'swift': 'swift',
            'kt': 'kotlin',
            'md': 'markdown',
            'xml': 'xml',
            'svg': 'xml'
        };
        
        return modes[ext] || 'javascript';
    }
}

// Create global instance
const projectManager = new ProjectManager();
window.projectManager = projectManager;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectManager;
}