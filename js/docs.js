// Search functionality
document.getElementById('searchDocs').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.doc-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.doc-title').textContent.toLowerCase();
        const description = card.querySelector('.doc-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
});

// Filter by category
function filterDocs(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter cards
    const cards = document.querySelectorAll('.doc-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Toggle FAQ
function toggleFAQ(element) {
    const faqItem = element.closest('.faq-item');
    faqItem.classList.toggle('active');
}

// Copy code to clipboard
function copyCode(button) {
    const codeBlock = button.nextElementSibling;
    const code = codeBlock.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy code');
    });
}

// Smooth scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.doc-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
});

// Track documentation views
function trackDocView(docTitle) {
    console.log('Viewing documentation:', docTitle);
    // Here you could send analytics data
}

// Add click handlers to doc cards
document.querySelectorAll('.doc-card').forEach(card => {
    card.addEventListener('click', function() {
        const title = this.querySelector('.doc-title').textContent;
        trackDocView(title);
        // In a real app, this would open the full documentation page
        alert(`Opening documentation: ${title}\n\nThis would open the full documentation page in a real implementation.`);
    });
});