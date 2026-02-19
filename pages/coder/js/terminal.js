/**
 * terminal.js - Advanced Terminal Emulator
 * Handles terminal commands, process management, and shell simulation
 */

class TerminalEmulator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.output = null;
        this.input = null;
        this.currentDir = '/home/user/project';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.processes = new Map();
        this.envVars = new Map();
        this.aliases = new Map();
        this.isRunning = true;
        
        this.init();
    }

    init() {
        this.createTerminalStructure();
        this.setupEventListeners();
        this.loadHistory();
        this.initDefaultEnv();
        this.initDefaultAliases();
        this.printWelcome();
    }

    createTerminalStructure() {
        // Create terminal HTML structure
        this.container.innerHTML = `
            <div class="terminal-window">
                <div class="terminal-header">
                    <div class="terminal-title">Terminal - amkyaw.dev</div>
                    <div class="terminal-controls">
                        <button class="terminal-btn" onclick="terminal.minimize()">─</button>
                        <button class="terminal-btn" onclick="terminal.maximize()">□</button>
                        <button class="terminal-btn close" onclick="terminal.close()">×</button>
                    </div>
                </div>
                <div class="terminal-output" id="terminal-output"></div>
                <div class="terminal-input-line">
                    <span class="terminal-prompt" id="terminal-prompt">user@amkyaw:~/project$</span>
                    <input type="text" class="terminal-input" id="terminal-input" autofocus>
                </div>
            </div>
        `;

        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.executeCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory(-1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(1);
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.autocomplete();
            } else if (e.ctrlKey && e.key === 'c') {
                e.preventDefault();
                this.interrupt();
            } else if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clear();
            }
        });

        // Focus input on any key
        document.addEventListener('keydown', (e) => {
            if (!e.target.closest('.terminal-input')) {
                this.input.focus();
            }
        });
    }

    initDefaultEnv() {
        this.envVars.set('PATH', '/usr/local/bin:/usr/bin:/bin');
        this.envVars.set('HOME', '/home/user');
        this.envVars.set('USER', 'developer');
        this.envVars.set('SHELL', '/bin/bash');
        this.envVars.set('TERM', 'xterm-256color');
        this.envVars.set('LANG', 'en_US.UTF-8');
        this.envVars.set('PWD', this.currentDir);
    }

    initDefaultAliases() {
        this.aliases.set('ll', 'ls -la');
        this.aliases.set('la', 'ls -a');
        this.aliases.set('gs', 'git status');
        this.aliases.set('gp', 'git push');
        this.aliases.set('gl', 'git pull');
        this.aliases.set('gc', 'git commit');
        this.aliases.set('gco', 'git checkout');
        this.aliases.set('npmr', 'npm run');
        this.aliases.set('npms', 'npm start');
        this.aliases.set('npmi', 'npm install');
    }

    printWelcome() {
        this.println('Welcome to amkyaw.dev Terminal v2.0.0', 'system');
        this.println('Type \'help\' for available commands', 'system');
        this.println('');
    }

    executeCommand() {
        const input = this.input.value.trim();
        if (!input) return;

        // Add to history
        this.commandHistory.push(input);
        this.historyIndex = this.commandHistory.length;
        this.saveHistory();

        // Display command
        this.print(`${this.getPrompt()} ${input}`, 'input');

        // Parse command
        let expandedInput = this.expandAlias(input);
        const args = this.parseCommand(expandedInput);
        const cmd = args[0];
        const cmdArgs = args.slice(1);

        // Execute
        if (this[cmd]) {
            try {
                this[cmd](cmdArgs);
            } catch (error) {
                this.println(`Error: ${error.message}`, 'error');
            }
        } else {
            this.println(`Command not found: ${cmd}`, 'error');
        }

        // Clear input
        this.input.value = '';
        this.updatePrompt();
    }

    // Built-in commands
    help(args) {
        this.println('Available commands:', 'header');
        
        const commands = {
            'File System': ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'cat'],
            'Process': ['ps', 'kill', 'jobs', 'fg', 'bg'],
            'System': ['clear', 'date', 'whoami', 'hostname', 'uname', 'uptime'],
            'Network': ['ping', 'curl', 'wget', 'ifconfig', 'netstat'],
            'Environment': ['env', 'export', 'alias', 'history'],
            'Development': ['git', 'npm', 'node', 'python', 'docker'],
            'Other': ['echo', 'which', 'man', 'exit']
        };

        for (const [category, cmds] of Object.entries(commands)) {
            this.println(`\n  ${category}:`, 'category');
            this.println(`    ${cmds.join(', ')}`);
        }
    }

    ls(args) {
        const showAll = args.includes('-la') || args.includes('-l') || args.includes('-a');
        const path = args.find(a => !a.startsWith('-')) || '.';
        
        // Simulate file listing
        const files = [
            { name: 'index.html', type: 'file', size: 347, perms: '-rw-r--r--' },
            { name: 'style.css', type: 'file', size: 1250, perms: '-rw-r--r--' },
            { name: 'script.js', type: 'file', size: 856, perms: '-rw-r--r--' },
            { name: 'node_modules', type: 'dir', size: 4096, perms: 'drwxr-xr-x' },
            { name: 'package.json', type: 'file', size: 245, perms: '-rw-r--r--' },
            { name: 'README.md', type: 'file', size: 125, perms: '-rw-r--r--' }
        ];

        if (showAll) {
            files.unshift(
                { name: '.', type: 'dir', size: 4096, perms: 'drwxr-xr-x' },
                { name: '..', type: 'dir', size: 4096, perms: 'drwxr-xr-x' },
                { name: '.git', type: 'dir', size: 4096, perms: 'drwxr-xr-x' },
                { name: '.env', type: 'file', size: 56, perms: '-rw-r--r--' }
            );
        }

        if (args.includes('-l')) {
            files.forEach(file => {
                const date = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                this.println(`${file.perms} 1 user staff ${file.size.toString().padStart(8)} ${date} ${file.name}`);
            });
        } else {
            const cols = 4;
            let line = '';
            files.forEach((file, i) => {
                const color = file.type === 'dir' ? '\x1b[34m' : '\x1b[0m';
                line += file.name.padEnd(20);
                if ((i + 1) % cols === 0) {
                    this.println(line);
                    line = '';
                }
            });
            if (line) this.println(line);
        }
    }

    cd(args) {
        const target = args[0] || '/home/user/project';
        
        if (target === '..') {
            this.currentDir = this.currentDir.split('/').slice(0, -1).join('/') || '/';
        } else if (target === '~') {
            this.currentDir = '/home/user';
        } else if (target.startsWith('/')) {
            this.currentDir = target;
        } else {
            this.currentDir = this.currentDir + (this.currentDir.endsWith('/') ? '' : '/') + target;
        }

        this.envVars.set('PWD', this.currentDir);
        this.updatePrompt();
    }

    pwd() {
        this.println(this.currentDir);
    }

    mkdir(args) {
        if (args.length === 0) {
            this.println('mkdir: missing operand', 'error');
            return;
        }

        args.forEach(dir => {
            this.println(`Created directory: ${dir}`, 'success');
        });
    }

    touch(args) {
        if (args.length === 0) {
            this.println('touch: missing file operand', 'error');
            return;
        }

        args.forEach(file => {
            this.println(`Created file: ${file}`, 'success');
        });
    }

    rm(args) {
        if (args.length === 0) {
            this.println('rm: missing operand', 'error');
            return;
        }

        const recursive = args.includes('-rf') || args.includes('-r');
        const files = args.filter(a => !a.startsWith('-'));

        files.forEach(file => {
            this.println(`Removed: ${file}`, 'warning');
        });
    }

    cp(args) {
        if (args.length < 2) {
            this.println('cp: missing file operand', 'error');
            return;
        }

        const source = args[0];
        const dest = args[1];
        this.println(`Copied ${source} to ${dest}`, 'success');
    }

    mv(args) {
        if (args.length < 2) {
            this.println('mv: missing file operand', 'error');
            return;
        }

        const source = args[0];
        const dest = args[1];
        this.println(`Moved ${source} to ${dest}`, 'success');
    }

    cat(args) {
        if (args.length === 0) {
            this.println('cat: missing file operand', 'error');
            return;
        }

        args.forEach(file => {
            this.println(`\n--- ${file} ---`, 'header');
            this.println('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            this.println('Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
        });
    }

    ps(args) {
        this.println('  PID  PPID  COMMAND');
        this.println(' 1234  1233  bash');
        this.println(' 1235  1234  node server.js');
        this.println(' 1236  1234  python app.py');
        this.println(' 1237  1236  npm run dev');
    }

    kill(args) {
        if (args.length === 0) {
            this.println('kill: missing PID', 'error');
            return;
        }

        const pid = parseInt(args[0]);
        if (this.processes.has(pid)) {
            this.processes.delete(pid);
            this.println(`Process ${pid} terminated`, 'success');
        } else {
            this.println(`kill: (${pid}) - No such process`, 'error');
        }
    }

    jobs() {
        this.println('[1]+  Running    node server.js &');
        this.println('[2]-  Stopped    python app.py');
    }

    fg(args) {
        const job = args[0] || 1;
        this.println(`Bringing job ${job} to foreground`);
    }

    bg(args) {
        const job = args[0] || 1;
        this.println(`Continuing job ${job} in background`);
    }

    clear() {
        this.output.innerHTML = '';
    }

    date() {
        this.println(new Date().toString());
    }

    whoami() {
        this.println(this.envVars.get('USER'));
    }

    hostname() {
        this.println('amkyaw-dev');
    }

    uname(args) {
        if (args.includes('-a')) {
            this.println('Linux amkyaw-dev 5.10.0 x86_64 GNU/Linux');
        } else {
            this.println('Linux');
        }
    }

    uptime() {
        this.println('14:32:45 up 2 days, 3:45, 3 users, load average: 0.08, 0.03, 0.01');
    }

    ping(args) {
        if (args.length === 0) {
            this.println('ping: missing host', 'error');
            return;
        }

        const host = args[0];
        this.println(`PING ${host} (8.8.8.8): 56 data bytes`);

        let count = 0;
        const interval = setInterval(() => {
            if (count >= 4) {
                clearInterval(interval);
                this.println('\n--- ${host} ping statistics ---');
                this.println('4 packets transmitted, 4 packets received, 0% packet loss');
                return;
            }

            const time = Math.floor(Math.random() * 20 + 10);
            this.println(`64 bytes from 8.8.8.8: icmp_seq=${count} ttl=56 time=${time}.${Math.floor(Math.random() * 9)}ms`);
            count++;
        }, 1000);
    }

    curl(args) {
        if (args.length === 0) {
            this.println('curl: missing URL', 'error');
            return;
        }

        const url = args[0];
        this.println(`Fetching ${url}...`);

        setTimeout(() => {
            this.println('HTTP/1.1 200 OK');
            this.println('Content-Type: application/json');
            this.println('');
            this.println('{');
            this.println('  "name": "amkyaw.dev",');
            this.println('  "version": "2.0.0",');
            this.println('  "status": "online"');
            this.println('}');
        }, 500);
    }

    wget(args) {
        if (args.length === 0) {
            this.println('wget: missing URL', 'error');
            return;
        }

        const url = args[0];
        const filename = url.split('/').pop() || 'index.html';

        this.println(`Downloading: ${url}`);
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            const bar = '█'.repeat(progress / 2) + '░'.repeat(50 - progress / 2);
            this.print(`\r[${bar}] ${progress}%`, 'raw');
            
            if (progress >= 100) {
                clearInterval(interval);
                this.println(`\nDownloaded: ${filename} (1.2 MB)`);
            }
        }, 200);
    }

    ifconfig() {
        this.println('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500');
        this.println('        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255');
        this.println('        inet6 fe80::1234:5678:9abc:def0  prefixlen 64  scopeid 0x20<link>');
        this.println('        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)');
        this.println('        RX packets 12345  bytes 12345678 (11.7 MiB)');
        this.println('        TX packets 6789  bytes 1234567 (1.1 MiB)');
    }

    netstat(args) {
        this.println('Active Internet connections (servers and established)');
        this.println('Proto Recv-Q Send-Q Local Address           Foreign Address         State');
        this.println('tcp        0      0 0.0.0.0:3000            0.0.0.0:*               LISTEN');
        this.println('tcp        0      0 127.0.0.1:5432          0.0.0.0:*               LISTEN');
        this.println('tcp        0      0 192.168.1.100:45012     93.184.216.34:80        ESTABLISHED');
    }

    env() {
        for (const [key, value] of this.envVars) {
            this.println(`${key}=${value}`);
        }
    }

    export(args) {
        if (args.length === 0) {
            this.env();
            return;
        }

        const match = args[0].match(/([^=]+)=(.*)/);
        if (match) {
            const [, key, value] = match;
            this.envVars.set(key, value);
            this.println(`Exported: ${key}=${value}`, 'success');
        }
    }

    alias(args) {
        if (args.length === 0) {
            for (const [name, cmd] of this.aliases) {
                this.println(`alias ${name}='${cmd}'`);
            }
            return;
        }

        const match = args[0].match(/([^=]+)=(.*)/);
        if (match) {
            const [, name, cmd] = match;
            this.aliases.set(name, cmd);
            this.println(`Alias created: ${name} -> ${cmd}`, 'success');
        }
    }

    unalias(args) {
        if (args.length === 0) {
            this.println('unalias: missing alias name', 'error');
            return;
        }

        const name = args[0];
        if (this.aliases.delete(name)) {
            this.println(`Alias removed: ${name}`, 'success');
        } else {
            this.println(`unalias: ${name}: not found`, 'error');
        }
    }

    history() {
        this.commandHistory.forEach((cmd, index) => {
            this.println(`  ${index + 1}  ${cmd}`);
        });
    }

    echo(args) {
        const text = args.join(' ');
        // Handle environment variables
        const expanded = text.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (match, name) => {
            return this.envVars.get(name) || match;
        });
        this.println(expanded);
    }

    which(args) {
        if (args.length === 0) {
            this.println('which: missing command', 'error');
            return;
        }

        const cmd = args[0];
        if (this[cmd]) {
            this.println(`/usr/bin/${cmd}`);
        } else {
            this.println(`${cmd}: command not found`, 'error');
        }
    }

    man(args) {
        if (args.length === 0) {
            this.println('What manual page do you want?', 'error');
            return;
        }

        const cmd = args[0];
        if (this[cmd]) {
            this.println(`\nNAME`);
            this.println(`       ${cmd} - ${this.getCommandDescription(cmd)}`);
            this.println(`\nSYNOPSIS`);
            this.println(`       ${cmd} [options] [arguments]`);
            this.println(`\nDESCRIPTION`);
            this.println(`       This is the manual page for the ${cmd} command.`);
            this.println(`       For more information, type '${cmd} --help' or visit the documentation.`);
        } else {
            this.println(`No manual entry for ${cmd}`, 'error');
        }
    }

    git(args) {
        if (args.length === 0) {
            this.println('git: missing command', 'error');
            return;
        }

        const subcmd = args[0];
        const subargs = args.slice(1);

        switch(subcmd) {
            case 'status':
                this.println('On branch main');
                this.println('Your branch is up to date with \'origin/main\'');
                this.println('');
                this.println('Changes not staged for commit:');
                this.println('  (use "git add <file>..." to update what will be committed)');
                this.println('  (use "git restore <file>..." to discard changes in working directory)');
                this.println('        modified:   index.html');
                this.println('');
                this.println('Untracked files:');
                this.println('  (use "git add <file>..." to include in what will be committed)');
                this.println('        newfile.js');
                break;

            case 'add':
                this.println(`Added ${subargs.join(' ')} to staging area`);
                break;

            case 'commit':
                const msgIndex = subargs.indexOf('-m');
                if (msgIndex !== -1 && subargs[msgIndex + 1]) {
                    this.println(`[main ${Math.random().toString(36).substring(2, 10)}] ${subargs[msgIndex + 1]}`);
                } else {
                    this.println('On branch main\nnothing to commit, working tree clean');
                }
                break;

            case 'push':
                this.println('Pushing to origin/main...');
                setTimeout(() => {
                    this.println('Done', 'success');
                }, 1000);
                break;

            case 'pull':
                this.println('Pulling from origin/main...');
                setTimeout(() => {
                    this.println('Already up to date.', 'success');
                }, 500);
                break;

            default:
                this.println(`git ${subcmd}: command executed`);
        }
    }

    npm(args) {
        if (args.length === 0) {
            this.println('npm: missing command', 'error');
            return;
        }

        const subcmd = args[0];
        const subargs = args.slice(1);

        switch(subcmd) {
            case 'install':
                const packages = subargs.length ? subargs.join(' ') : 'dependencies';
                this.println(`Installing ${packages}...`);
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    this.print(`\rProgress: ${progress}%`);
                    if (progress >= 100) {
                        clearInterval(interval);
                        this.println('\n✅ added 150 packages in 3s');
                    }
                }, 300);
                break;

            case 'start':
                this.println('> project@1.0.0 start');
                this.println('> node server.js');
                this.println('');
                this.println('Server running at http://localhost:3000');
                break;

            case 'run':
                const script = subargs[0] || 'dev';
                this.println(`> project@1.0.0 ${script}`);
                this.println(`> node ${script}.js`);
                this.println('');
                this.println(`Running ${script} script...`);
                break;

            default:
                this.println(`npm ${subcmd}: command executed`);
        }
    }

    node(args) {
        if (args.length === 0) {
            this.println('Welcome to Node.js v18.12.0');
            this.println('Type ".help" for more information.');
            return;
        }

        const script = args[0];
        this.println(`Running ${script}...`);
        setTimeout(() => {
            this.println('Hello from Node.js!');
            this.println('Execution complete');
        }, 500);
    }

    python(args) {
        if (args.length === 0) {
            this.println('Python 3.9.7 (default, Oct 10 2024, 12:00:00)');
            this.println('[GCC 11.2.0] on linux');
            this.println('Type "help", "copyright", "credits" or "license" for more information.');
            return;
        }

        const script = args[0];
        this.println(`Running ${script}...`);
        setTimeout(() => {
            this.println('Hello from Python!');
            this.println('Execution complete');
        }, 500);
    }

    docker(args) {
        if (args.length === 0) {
            this.println('docker: missing command', 'error');
            return;
        }

        const subcmd = args[0];
        const subargs = args.slice(1);

        switch(subcmd) {
            case 'ps':
                this.println('CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES');
                break;

            case 'images':
                this.println('REPOSITORY   TAG       IMAGE ID       CREATED       SIZE');
                this.println('node         16        a1b2c3d4e5f6   2 weeks ago   900MB');
                this.println('python       3.9       b2c3d4e5f6a7   3 weeks ago   885MB');
                break;

            case 'build':
                this.println(`Building ${subargs[0] || 'image'}...`);
                setTimeout(() => {
                    this.println('Successfully built a1b2c3d4e5f6', 'success');
                }, 2000);
                break;

            case 'run':
                this.println(`Running container from ${subargs[0] || 'image'}...`);
                setTimeout(() => {
                    this.println('Container started: c1d2e3f4a5b6', 'success');
                }, 1000);
                break;

            default:
                this.println(`docker ${subcmd}: command executed`);
        }
    }

    exit() {
        this.println('Exit terminal? (Y/n)', 'warning');
        // In real app, would close tab
    }

    // Utility methods
    print(text, type = 'normal') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.innerHTML = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    println(text, type = 'normal') {
        this.print(text + '\n', type);
    }

    getPrompt() {
        const user = this.envVars.get('USER');
        const host = 'amkyaw';
        const dir = this.currentDir.replace(this.envVars.get('HOME'), '~');
        return `${user}@${host}:${dir}$`;
    }

    updatePrompt() {
        const prompt = document.getElementById('terminal-prompt');
        if (prompt) {
            prompt.textContent = this.getPrompt();
        }
    }

    navigateHistory(direction) {
        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.input.value = '';
            return;
        }

        if (this.commandHistory[this.historyIndex]) {
            this.input.value = this.commandHistory[this.historyIndex];
        }
    }

    autocomplete() {
        const input = this.input.value;
        const commands = Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(name => name !== 'constructor' && typeof this[name] === 'function');
        
        const matches = commands.filter(cmd => cmd.startsWith(input));
        
        if (matches.length === 1) {
            this.input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
            this.println('');
            this.println(matches.join('  '));
            this.print(this.getPrompt() + ' ' + input);
        }
    }

    interrupt() {
        this.println('^C', 'error');
        // Cancel any running process
    }

    expandAlias(input) {
        const [cmd, ...args] = input.split(' ');
        const alias = this.aliases.get(cmd);
        
        if (alias) {
            return alias + (args.length ? ' ' + args.join(' ') : '');
        }
        
        return input;
    }

    parseCommand(input) {
        const args = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if ((char === '"' || char === "'") && (!inQuote || quoteChar === char)) {
                inQuote = !inQuote;
                quoteChar = inQuote ? char : '';
            } else if (char === ' ' && !inQuote) {
                if (current) {
                    args.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            args.push(current);
        }

        return args;
    }

    getCommandDescription(cmd) {
        const descriptions = {
            'ls': 'list directory contents',
            'cd': 'change directory',
            'pwd': 'print working directory',
            'mkdir': 'make directories',
            'touch': 'change file timestamps',
            'rm': 'remove files or directories',
            'cp': 'copy files',
            'mv': 'move files',
            'cat': 'concatenate and print files',
            'ps': 'report process status',
            'kill': 'terminate a process',
            'clear': 'clear the terminal screen',
            'date': 'print system date and time',
            'whoami': 'print current user',
            'hostname': 'print system hostname',
            'uname': 'print system information',
            'uptime': 'print system uptime',
            'ping': 'send ICMP echo request',
            'curl': 'transfer data from URLs',
            'wget': 'download files',
            'ifconfig': 'configure network interface',
            'netstat': 'print network connections',
            'env': 'print environment variables',
            'export': 'set environment variable',
            'alias': 'create command alias',
            'unalias': 'remove command alias',
            'history': 'print command history',
            'echo': 'print arguments',
            'which': 'locate a command',
            'man': 'display manual pages',
            'git': 'version control system',
            'npm': 'node package manager',
            'node': 'JavaScript runtime',
            'python': 'Python interpreter',
            'docker': 'container platform',
            'exit': 'exit the terminal'
        };

        return descriptions[cmd] || 'a terminal command';
    }

    saveHistory() {
        localStorage.setItem('terminal_history', JSON.stringify(this.commandHistory.slice(-100)));
    }

    loadHistory() {
        const saved = localStorage.getItem('terminal_history');
        if (saved) {
            this.commandHistory = JSON.parse(saved);
            this.historyIndex = this.commandHistory.length;
        }
    }

    minimize() {
        // Implement minimize
        console.log('Terminal minimized');
    }

    maximize() {
        // Implement maximize
        console.log('Terminal maximized');
    }

    close() {
        if (confirm('Close terminal?')) {
            this.container.remove();
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TerminalEmulator;
}
