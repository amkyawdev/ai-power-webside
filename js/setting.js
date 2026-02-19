// Current user settings
let currentSettings = {
    avatar: 1,
    displayName: 'John Doe',
    gender: 'male',
    bio: '',
    darkMode: true,
    compactView: false,
    language: 'en'
};

// Select avatar
function selectAvatar(avatarId) {
    // Update UI
    document.querySelectorAll('.avatar-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    currentSettings.avatar = avatarId;
}

// Select language
function selectLanguage(lang) {
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    currentSettings.language = lang;
    
    // Load language file
    loadLanguage(lang);
}

// Load language file
function loadLanguage(lang) {
    const languageFiles = {
        'en': '../lug/English.js',
        'my': '../lug/Myanmar.js',
        'th': '../lug/Thailand.js',
        'zh': '../lug/Chinese.js',
        'ru': '../lug/Russian.js'
    };
    
    const script = document.createElement('script');
    script.src = languageFiles[lang];
    document.head.appendChild(script);
}

// Save settings
function saveSettings() {
    // Get form values
    currentSettings.displayName = document.getElementById('displayName').value;
    currentSettings.gender = document.getElementById('gender').value;
    currentSettings.bio = document.getElementById('bio').value;
    currentSettings.darkMode = document.getElementById('darkMode').checked;
    currentSettings.compactView = document.getElementById('compactView').checked;
    
    // Save to localStorage
    localStorage.setItem('userSettings', JSON.stringify(currentSettings));
    
    // Apply theme
    applyTheme(currentSettings.darkMode);
    
    // Show success message
    alert('Settings saved successfully!');
}

// Apply theme
function applyTheme(isDark) {
    if (isDark) {
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else {
        document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        document.body.style.color = '#333';
    }
}

// Load saved settings on page load
document.addEventListener('DOMContentLoaded', function() {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
        currentSettings = JSON.parse(saved);
        
        // Apply settings to UI
        document.querySelectorAll('.avatar-item')[currentSettings.avatar - 1].classList.add('selected');
        document.getElementById('displayName').value = currentSettings.displayName;
        document.getElementById('gender').value = currentSettings.gender;
        document.getElementById('bio').value = currentSettings.bio;
        document.getElementById('darkMode').checked = currentSettings.darkMode;
        document.getElementById('compactView').checked = currentSettings.compactView;
        
        // Apply theme
        applyTheme(currentSettings.darkMode);
    }
});

// Auto-save on toggle changes
document.getElementById('darkMode').addEventListener('change', function() {
    applyTheme(this.checked);
    saveSettings();
});