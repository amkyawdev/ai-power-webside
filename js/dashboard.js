// Navigation function
function navigate(page) {
    switch(page) {
        case 'dashboard':
            window.location.href = 'dashboard.html';
            break;
        case 'chat':
            window.location.href = 'chat.html';
            break;
        case 'coder':
            window.location.href = 'coder.html';
            break;
        case 'docs':
            window.location.href = 'docs.html';
            break;
        case 'settings':
            window.location.href = 'setting.html';
            break;
        case 'about':
            window.location.href = 'about.html';
            break;
    }
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('open');
}

// Toggle aside menu (for mobile)
function toggleAside() {
    const aside = document.getElementById('asideMenu');
    aside.classList.toggle('open');
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.getElementById('mobileMenu');
    const asideMenu = document.getElementById('asideMenu');
    const menuToggle = document.querySelector('.menu-toggle');
    const asideToggle = document.querySelector('.aside-toggle');
    
    if (mobileMenu.classList.contains('open') && 
        !mobileMenu.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        mobileMenu.classList.remove('open');
    }
    
    if (asideMenu.classList.contains('open') && 
        !asideMenu.contains(e.target) && 
        !asideToggle.contains(e.target)) {
        asideMenu.classList.remove('open');
    }
});

// Check user authentication
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        console.log('User:', user.email);
    } else {
        // User is signed out, redirect to login after 3 seconds
        setTimeout(() => {
            if (!window.location.href.includes('login.html')) {
                window.location.href = '../auth/login.html';
            }
        }, 3000);
    }
});

// Smooth scroll and animations
document.addEventListener('DOMContentLoaded', () => {
    // Add fade-in animation to content
    const content = document.querySelector('.content');
    content.style.opacity = '0';
    content.style.transition = 'opacity 1s ease';
    setTimeout(() => {
        content.style.opacity = '1';
    }, 100);
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});