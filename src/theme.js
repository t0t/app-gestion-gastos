// Theme management
document.addEventListener('DOMContentLoaded', function() {
    console.log('Theme script loaded');

    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (!toggle || !html || !sunIcon || !moonIcon) {
        console.error('Missing required elements');
        return;
    }

    function setTheme(isDark) {
        console.log('Setting theme:', isDark ? 'dark' : 'light');
        console.log('HTML classes before:', html.classList.toString());
        
        try {
            if (isDark) {
                html.classList.add('dark');
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
                localStorage.theme = 'dark';
            } else {
                html.classList.remove('dark');
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
                localStorage.theme = 'light';
            }
            console.log('Theme set successfully');
        } catch (error) {
            console.error('Error setting theme:', error);
        }
        
        console.log('HTML classes after:', html.classList.toString());
    }

    // Toggle theme on click
    toggle.addEventListener('click', (event) => {
        console.log('Toggle clicked');
        const isDark = html.classList.contains('dark');
        console.log('Current dark mode:', isDark);
        
        try {
            event.preventDefault();
            setTheme(!isDark);
            console.log('Theme toggled successfully');
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    });

    // Set initial theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hasStoredTheme = 'theme' in localStorage;
    const storedTheme = localStorage.theme;
    
    console.log('Initial theme setup:', {
        prefersDark,
        hasStoredTheme,
        storedTheme
    });

    if (storedTheme === 'dark' || (!hasStoredTheme && prefersDark)) {
        setTheme(true);
    } else {
        setTheme(false);
    }
});
