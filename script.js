document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetTab) {
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        const activeButton = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(targetTab);
        
        if (activeButton && activeContent) {
            activeButton.classList.add('active');
            activeContent.classList.add('active');
        }

        // Smooth scroll to top of content
        document.querySelector('.main-content').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Add click event listeners to tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
            
            // Update URL without reload (for better UX)
            history.pushState(null, null, `#${targetTab}`);
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', function() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchTab(hash);
        }
    });

    // Check URL hash on page load
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        switchTab(initialHash);
    }

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add hover effects to comparison table rows
    const tableRows = document.querySelectorAll('.table-row');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
            this.style.transform = 'scale(1.01)';
            this.style.transition = 'all 0.2s ease';
        });

        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '';
            this.style.transform = 'scale(1)';
        });
    });

    // Enhanced tooltip functionality for highlights
    function initializeHighlightTooltips() {
        const highlights = document.querySelectorAll('.highlight');
        
        highlights.forEach(highlight => {
            const tooltip = highlight.querySelector('.highlight-tooltip');
            
            if (tooltip) {
                // Position tooltip to avoid going off screen
                highlight.addEventListener('mouseenter', function() {
                    const rect = this.getBoundingClientRect();
                    const tooltipRect = tooltip.getBoundingClientRect();
                    
                    // Check if tooltip would go off right edge
                    if (rect.left + tooltipRect.width / 2 > window.innerWidth - 20) {
                        tooltip.style.left = 'auto';
                        tooltip.style.right = '0';
                        tooltip.style.transform = 'translateX(0)';
                    }
                    // Check if tooltip would go off left edge
                    else if (rect.left - tooltipRect.width / 2 < 20) {
                        tooltip.style.left = '0';
                        tooltip.style.right = 'auto';
                        tooltip.style.transform = 'translateX(0)';
                    }
                    // Default center positioning
                    else {
                        tooltip.style.left = '50%';
                        tooltip.style.right = 'auto';
                        tooltip.style.transform = 'translateX(-50%)';
                    }
                });

                // Add click to pin/unpin tooltip functionality
                highlight.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const isPinned = this.classList.contains('pinned');
                    
                    // Remove pinned class from all other highlights
                    document.querySelectorAll('.highlight.pinned').forEach(h => {
                        if (h !== this) h.classList.remove('pinned');
                    });
                    
                    // Toggle pinned state
                    this.classList.toggle('pinned', !isPinned);
                    
                    // Visual feedback
                    if (!isPinned) {
                        this.style.boxShadow = '0 0 10px rgba(37, 99, 235, 0.5)';
                        tooltip.style.opacity = '1';
                        tooltip.style.visibility = 'visible';
                    } else {
                        this.style.boxShadow = '';
                    }
                });
            }
        });

        // Click outside to unpin all tooltips
        document.addEventListener('click', function() {
            document.querySelectorAll('.highlight.pinned').forEach(highlight => {
                highlight.classList.remove('pinned');
                highlight.style.boxShadow = '';
            });
        });
    }

    // Initialize highlight tooltips
    initializeHighlightTooltips();

    // Add highlight statistics
    function addHighlightStats() {
        const meritHighlights = document.querySelector('#merit .highlights-legend');
        const distinctionHighlights = document.querySelector('#distinction .highlights-legend');
        
        if (meritHighlights) {
            const meritCount = document.querySelectorAll('#merit .highlight').length;
            const counter = meritHighlights.querySelector('.highlight-counter');
            if (counter) counter.textContent = `${meritCount} highlights`;
        }

        if (distinctionHighlights) {
            const distinctionCount = document.querySelectorAll('#distinction .highlight').length;
            const counter = distinctionHighlights.querySelector('.highlight-counter');
            if (counter) counter.textContent = `${distinctionCount} highlights`;
        }
    }

    // Initialize highlight stats
    addHighlightStats();





    // Add highlight toggle functionality
    function initializeHighlightToggles() {
        const toggles = document.querySelectorAll('.highlight-toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const highlightType = this.closest('.legend-item').getAttribute('data-highlight-type');
                const currentTab = document.querySelector('.tab-content.active');
                
                if (!currentTab) return;
                
                // Special handling for comments type
                if (highlightType === 'comments') {
                    const allTooltips = currentTab.querySelectorAll('.highlight-tooltip');
                    allTooltips.forEach(tooltip => {
                        if (this.checked) {
                            tooltip.style.display = '';
                        } else {
                            tooltip.style.display = 'none';
                        }
                    });

                    // Also unpin any pinned highlights so no tooltip stays forced-open
                    if (!this.checked) {
                        currentTab.querySelectorAll('.highlight.pinned').forEach(h => h.classList.remove('pinned'));
                    }

                    // Add visual feedback to legend item
                    const legendItem = this.closest('.legend-item');
                    legendItem.classList.toggle('disabled', !this.checked);
                    return;
                }
                
                const highlights = currentTab.querySelectorAll(`.highlight-${highlightType}`);
                console.log(`Toggle ${highlightType}: ${this.checked ? 'ON' : 'OFF'}, found ${highlights.length} highlights`);
                
                highlights.forEach(highlight => {
                    if (this.checked) {
                        // Show highlight - restore original classes
                        highlight.style.removeProperty('background-color');
                        highlight.style.removeProperty('border-bottom');
                        highlight.style.removeProperty('padding');
                        highlight.style.removeProperty('border-radius');
                        highlight.classList.remove('highlight-hidden');
                        highlight.classList.add('highlight-visible');
                        
                        // Restore tooltip functionality
                        const tooltip = highlight.querySelector('.highlight-tooltip');
                        if (tooltip) tooltip.style.display = '';
                    } else {
                        // Hide highlight completely - make it look like normal text
                        highlight.style.backgroundColor = 'transparent';
                        highlight.style.borderBottom = 'none';
                        highlight.style.padding = '0';
                        highlight.style.borderRadius = '0';
                        highlight.classList.remove('highlight-visible');
                        highlight.classList.add('highlight-hidden');
                        
                        // Hide tooltip
                        const tooltip = highlight.querySelector('.highlight-tooltip');
                        if (tooltip) tooltip.style.display = 'none';
                    }
                });

                // Update counter
                updateHighlightCounter(currentTab);
                
                // Add visual feedback to legend item
                const legendItem = this.closest('.legend-item');
                legendItem.classList.toggle('disabled', !this.checked);
            });
        });

        // Select All functionality
        const selectAllButtons = document.querySelectorAll('[id*="selectAll"]');
        selectAllButtons.forEach(button => {
            button.addEventListener('click', function() {
                const currentTab = document.querySelector('.tab-content.active');
                const togglesInTab = currentTab.querySelectorAll('.highlight-toggle');
                
                togglesInTab.forEach(toggle => {
                    toggle.checked = true;
                    toggle.dispatchEvent(new Event('change'));
                });
            });
        });

        // Clear All functionality
        const clearAllButtons = document.querySelectorAll('[id*="clearAll"]');
        clearAllButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Find the current active tab
                const currentTab = document.querySelector('.tab-content.active');
                if (!currentTab) return;
                
                // Get toggles within the current tab's highlights-legend
                const togglesInTab = currentTab.querySelectorAll('.highlight-toggle');
                
                togglesInTab.forEach(toggle => {
                    toggle.checked = false;
                    toggle.dispatchEvent(new Event('change'));
                });
            });
        });
    }

    // Update highlight counter based on visible highlights
    function updateHighlightCounter(tabContent) {
        const visibleHighlights = tabContent.querySelectorAll('.highlight.highlight-visible').length;
        const counter = tabContent.querySelector('.highlight-counter');
        if (counter) {
            counter.textContent = `${visibleHighlights} highlights`;
        }
    }

    // Initialize highlight toggles
    initializeHighlightToggles();

    // Reset toggles when switching tabs
    const originalSwitchTab = switchTab;
    switchTab = function(targetTab) {
        originalSwitchTab(targetTab);
        
        // Reset all toggles to checked state when switching tabs
        setTimeout(() => {
            const currentTabContent = document.getElementById(targetTab);
            if (currentTabContent) {
                const toggles = currentTabContent.querySelectorAll('.highlight-toggle');
                toggles.forEach(toggle => {
                    if (!toggle.checked) {
                        toggle.checked = true;
                        toggle.dispatchEvent(new Event('change'));
                    }
                });
                
                // Reset all highlights to visible
                const allHighlights = currentTabContent.querySelectorAll('.highlight');
                allHighlights.forEach(highlight => {
                    highlight.classList.remove('highlight-hidden');
                    highlight.classList.add('highlight-visible');
                });
                
                // Reset legend items
                const legendItems = currentTabContent.querySelectorAll('.legend-item');
                legendItems.forEach(item => {
                    item.classList.remove('disabled');
                });
            }
        }, 50);
    };

    // Add click-to-copy functionality for text sections (useful for study)
    const textSections = document.querySelectorAll('.example-text p');
    textSections.forEach(section => {
        section.addEventListener('click', function(e) {
            // Don't copy if clicking on a highlight
            if (e.target.closest('.highlight')) return;
            
            // Create a temporary textarea to copy text
            const textArea = document.createElement('textarea');
            textArea.value = this.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                
                // Show feedback
                const originalBg = this.style.backgroundColor;
                this.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                this.style.transition = 'background-color 0.2s ease';
                
                setTimeout(() => {
                    this.style.backgroundColor = originalBg;
                }, 1000);
                
            } catch (err) {
                console.log('Copy failed');
            }
            
            document.body.removeChild(textArea);
        });

        // Add visual indicator that text is clickable
        section.style.cursor = 'pointer';
        section.title = 'Click to copy this paragraph (avoid highlights)';
    });

    // Add search functionality
    function addSearchFeature() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search content..." />
                <i class="fas fa-search"></i>
            </div>
            <div id="searchResults" class="search-results"></div>
        `;

        // Insert search after header
        const header = document.querySelector('.header');
        header.insertAdjacentElement('afterend', searchContainer);

        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            
            if (query.length < 3) {
                searchResults.innerHTML = '';
                return;
            }

            const allText = document.querySelectorAll('.example-text p, .comparison-section p, .analysis-box li');
            const matches = [];

            allText.forEach((element, index) => {
                const text = element.textContent.toLowerCase();
                if (text.includes(query)) {
                    const preview = element.textContent.substring(0, 150) + '...';
                    const tabId = element.closest('.tab-content')?.id || 'unknown';
                    matches.push({
                        preview,
                        tabId,
                        element: element
                    });
                }
            });

            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(match => `
                    <div class="search-result" data-tab="${match.tabId}">
                        <div class="search-preview">${match.preview}</div>
                        <div class="search-tab">Found in: ${match.tabId.charAt(0).toUpperCase() + match.tabId.slice(1)}</div>
                    </div>
                `).join('');

                // Add click handlers to search results
                document.querySelectorAll('.search-result').forEach(result => {
                    result.addEventListener('click', function() {
                        const tabId = this.getAttribute('data-tab');
                        switchTab(tabId);
                        searchResults.innerHTML = '';
                        searchInput.value = '';
                    });
                });
            } else {
                searchResults.innerHTML = '<div class="no-results">No results found</div>';
            }
        });
    }

    // Initialize search feature
    addSearchFeature();

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + number keys to switch tabs
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            const tabIds = ['overview', 'merit', 'distinction', 'comparison'];
            if (tabIds[tabIndex]) {
                switchTab(tabIds[tabIndex]);
            }
        }

        // ESC to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');
            if (searchInput && searchResults) {
                searchInput.value = '';
                searchResults.innerHTML = '';
            }
        }
    });

    // Add CSS for search functionality
    const searchStyles = `
        .search-container {
            background: white;
            border-bottom: 1px solid var(--border-light);
            padding: 1rem 0;
        }

        .search-box {
            position: relative;
            max-width: 600px;
            margin: 0 auto;
        }

        .search-box input {
            width: 100%;
            padding: 0.75rem 3rem 0.75rem 1rem;
            border: 2px solid var(--border-light);
            border-radius: 25px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .search-box input:focus {
            outline: none;
            border-color: var(--primary-blue);
        }

        .search-box i {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-gray);
        }

        .search-results {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--border-light);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            max-height: 300px;
            overflow-y: auto;
            z-index: 200;
        }

        .search-result {
            padding: 1rem;
            border-bottom: 1px solid var(--border-light);
            cursor: pointer;
            transition: background-color 0.2s ease;
        }

        .search-result:hover {
            background-color: var(--bg-light);
        }

        .search-result:last-child {
            border-bottom: none;
        }

        .search-preview {
            font-size: 0.9rem;
            line-height: 1.4;
            margin-bottom: 0.5rem;
        }

        .search-tab {
            font-size: 0.8rem;
            color: var(--text-gray);
            font-weight: 500;
        }

        .no-results {
            padding: 1rem;
            text-align: center;
            color: var(--text-gray);
        }

        @media (max-width: 768px) {
            .search-container {
                padding: 0.75rem;
            }
        }
    `;

    // Inject search styles
    const style = document.createElement('style');
    style.textContent = searchStyles;
    document.head.appendChild(style);

    // Add progress indicator for long content
    function addProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            document.querySelector('.progress-fill').style.width = Math.min(scrolled, 100) + '%';
        });
    }

    // Initialize progress indicator
    addProgressIndicator();

    // Add progress bar styles
    const progressStyles = `
        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background-color: rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }

        .progress-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, var(--primary-blue), var(--accent-purple));
            transition: width 0.1s ease;
        }
    `;

    const progressStyle = document.createElement('style');
    progressStyle.textContent = progressStyles;
    document.head.appendChild(progressStyle);

    // Add print functionality
    function addPrintButton() {
        const printButton = document.createElement('button');
        printButton.innerHTML = '<i class="fas fa-print"></i> Print';
        printButton.className = 'print-button';
        printButton.addEventListener('click', function() {
            window.print();
        });

        const header = document.querySelector('.header .container');
        header.appendChild(printButton);
    }

    // Initialize print button
    addPrintButton();

    // Add print button styles
    const printStyles = `
        .print-button {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .print-button:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
            .print-button {
                position: static;
                margin-top: 1rem;
            }
        }

        @media print {
            .print-button {
                display: none;
            }
        }
    `;

    const printStyle = document.createElement('style');
    printStyle.textContent = printStyles;
    document.head.appendChild(printStyle);

    console.log('BTEC Psychology Web App initialized successfully!');
});