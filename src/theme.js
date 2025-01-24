// Theme management
import debug from 'debug';

// Enable debugging in the browser
localStorage.debug = 'theme:*';

const log = debug('theme:main');
const logToggle = debug('theme:toggle');
const logTheme = debug('theme:set');

document.addEventListener('DOMContentLoaded', function() {
    log('Theme script loaded');

    const toggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    log('Elements found: %O', {
        toggle: !!toggle,
        html: !!html,
        sunIcon: !!sunIcon,
        moonIcon: !!moonIcon
    });

    if (!toggle || !html || !sunIcon || !moonIcon) {
        log.error('Missing required elements');
        return;
    }

    function setTheme(isDark) {
        logTheme('Setting theme to %s', isDark ? 'dark' : 'light');
        logTheme('HTML classes before: %s', html.classList.toString());
        
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
            logTheme('Theme set successfully');
        } catch (error) {
            logTheme.error('Error setting theme: %O', error);
        }
        
        logTheme('HTML classes after: %s', html.classList.toString());
    }

    // Toggle theme on click
    toggle.addEventListener('click', (event) => {
        logToggle('Toggle clicked');
        const isDark = html.classList.contains('dark');
        logToggle('Current dark mode: %s', isDark);
        
        try {
            event.preventDefault();
            setTheme(!isDark);
            logToggle('Theme toggled successfully');
        } catch (error) {
            logToggle.error('Error toggling theme: %O', error);
        }
    });

    // Set initial theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hasStoredTheme = 'theme' in localStorage;
    const storedTheme = localStorage.theme;
    
    log('Initial theme setup: %O', {
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
