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
                        if (h !== this) {
                            h.classList.remove('pinned');
                            h.style.boxShadow = '';
                        }
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

    // Remove all tooltip headers/contents as requested
    (function removeAllTooltipHeaderContent() {
        document.querySelectorAll('.tooltip-header, .tooltip-content').forEach(el => el.remove());
    })();

    // Ensure tooltips exist before wiring interactions (only the container if missing)
    ensureAllHighlightsHaveTooltips();

    // Populate hover tooltip content for all highlights
    populateAllHighlightTooltips();

    // Initialize highlight tooltips
    initializeHighlightTooltips();

    // Normalize initial legend state for the default active tab (remove any pre-set disabled styling)
    (function normalizeInitialLegendState() {
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) return;
        activeTab.querySelectorAll('.legend-item').forEach(item => item.classList.remove('disabled'));
    })();

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

    // Ensure every highlighted span has an associated tooltip
    function ensureAllHighlightsHaveTooltips() {
        const allHighlights = document.querySelectorAll('.highlight');
        allHighlights.forEach((hl) => {
            // If this highlight lacks a tooltip, attach an empty container only
            if (!hl.querySelector('.highlight-tooltip')) {
                const tooltip = document.createElement('span');
                tooltip.className = 'highlight-tooltip';
                hl.appendChild(tooltip);
            }
        });
    }

    // Already executed above before initializing tooltip listeners

    // Generate suitable tooltip content for each highlight based on type and tab
    function populateAllHighlightTooltips() {
        const meritMap = {
            strength: {
                header: '✓ Strong Knowledge',
                body: 'Clearly identifies key points; shows solid understanding of fundamentals.'
            },
            weakness: {
                header: '⚠️ Area to Develop',
                body: 'Touches on the idea but needs more depth or specific evidence.'
            },
            example: {
                header: '📚 Good Example',
                body: 'Relevant example supports the point; consider linking it to analysis.'
            },
            method: {
                header: '🔬 Method Understanding',
                body: 'Identifies the method; could add why it was appropriate or any limitations.'
            },
            ethics: {
                header: '⚖️ Ethics Coverage',
                body: 'Acknowledges participant protection and key guidelines (e.g., BPS).'
            },
            evaluation: {
                header: '📊 Basic Evaluation',
                body: 'Explains importance; aim to weigh strengths and limitations more critically.'
            },
            application: {
                header: '🌍 Application',
                body: 'Connects ideas to real-world impact; specify outcomes where possible.'
            }
        };

        const distinctionMap = {
            strength: {
                header: '⭐ Advanced Insight',
                body: 'Demonstrates sophisticated understanding with precise, analytical language.'
            },
            weakness: {
                header: '⚠️ Critical Challenge',
                body: 'Identifies limitations and suggests how to address them methodologically or ethically.'
            },
            example: {
                header: '📚 Impactful Evidence',
                body: 'Well-chosen study integrated with argument and broader implications.'
            },
            method: {
                header: '🔬 Comprehensive Methods',
                body: 'Justifies method choice and notes validity, reliability, and limitations.'
            },
            ethics: {
                header: '⚖️ Professional Ethics',
                body: 'Applies BPS principles effectively and evaluates ethical trade-offs.'
            },
            evaluation: {
                header: '🎯 Critical Evaluation',
                body: 'Weighs strengths and weaknesses to draw justified conclusions.'
            },
            application: {
                header: '🌍 Policy/Practice Impact',
                body: 'Shows clear research-to-practice links and societal significance.'
            }
        };

        const defaultMap = meritMap; // Fallback for overview/comparison if any highlights exist

        document.querySelectorAll('.highlight').forEach(hl => {
            const inDistinction = !!hl.closest('#distinction');
            const inMerit = !!hl.closest('#merit');
            const map = inDistinction ? distinctionMap : (inMerit ? meritMap : defaultMap);

            // Determine type from class list
            const type = ['strength','weakness','example','method','ethics','evaluation','application']
                .find(t => hl.classList.contains(`highlight-${t}`));

            const tooltip = hl.querySelector('.highlight-tooltip');
            if (!tooltip) return;

            const config = type ? map[type] : { header: '💬 Comment', body: 'Relevant point highlighted.' };

            // Only populate if empty or not yet generated
            if (!tooltip.hasChildNodes() || !tooltip.dataset.generated) {
                tooltip.innerHTML = `
                    <div class="tooltip-header">${config.header}</div>
                    <div class="tooltip-content">${config.body}</div>
                `;
                tooltip.dataset.generated = 'true';
            }
        });
    }





    // Add highlight toggle functionality
    function initializeHighlightToggles() {
        const toggles = document.querySelectorAll('.highlight-toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('change', function() {
                const highlightType = this.closest('.legend-item').getAttribute('data-highlight-type');
                const currentTab = document.querySelector('.tab-content.active');
                
                if (!currentTab) return;
                
                // Comments selector removed; only standard highlight types remain
                
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

                // Restore any hover tooltips display in case they were hidden previously
                currentTabContent.querySelectorAll('.highlight-tooltip').forEach(tp => {
                    tp.style.display = '';
                });
                // Comments selector removed; nothing to reset for inline comments
                
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

// Side-by-Side Comparison Logic
document.addEventListener('DOMContentLoaded', function() {
    const modeButtons = document.querySelectorAll('#comparison .mode-btn');
    const comparisonSections = document.querySelectorAll('#comparison .comparison-section, #comparison .summary-box');
    const sbsView = document.getElementById('sideBySideView');
    const sbsRows = document.getElementById('sbsRows');
    const sbsSvg = document.getElementById('sbsConnectors');
    const toggleConnectors = document.getElementById('toggle-connectors');

    if (!modeButtons.length) return;

    function clearSvg() {
        if (sbsSvg) sbsSvg.innerHTML = '';
    }

    function buildSideBySide() {
        if (!sbsRows) return;
        sbsRows.innerHTML = '';
        clearSvg();

        const meritParas = Array.from(document.querySelectorAll('#merit .example-text p'));
        const distParas = Array.from(document.querySelectorAll('#distinction .example-text p'));
        const maxRows = Math.max(meritParas.length, distParas.length);

        for (let i = 0; i < maxRows; i++) {
            const row = document.createElement('div');
            row.className = 'sbs-row';

            const leftCell = document.createElement('div');
            leftCell.className = 'sbs-cell';
            const rightCell = document.createElement('div');
            rightCell.className = 'sbs-cell';

            if (meritParas[i]) leftCell.innerHTML = meritParas[i].innerHTML;
            else leftCell.classList.add('unmatched');

            if (distParas[i]) rightCell.innerHTML = distParas[i].innerHTML;
            else rightCell.classList.add('unmatched');

            sbsRows.appendChild(leftCell);
            sbsRows.appendChild(rightCell);
        }

        // After laying out, draw connectors
        requestAnimationFrame(drawConnectors);
    }

    function drawConnectors() {
        if (!sbsSvg || !toggleConnectors?.checked) { clearSvg(); return; }
        clearSvg();

        const leftCells = sbsRows.querySelectorAll('.sbs-cell:nth-child(2n-1)');
        const rightCells = sbsRows.querySelectorAll('.sbs-cell:nth-child(2n)');

        const typeList = ['strength','weakness','example','method','ethics','evaluation','application'];

        leftCells.forEach((leftCell, idx) => {
            const rightCell = rightCells[idx];
            if (!rightCell) return;

            typeList.forEach(type => {
                const leftHighlights = leftCell.querySelectorAll(`.highlight-${type}`);
                const rightHighlights = rightCell.querySelectorAll(`.highlight-${type}`);

                const pairCount = Math.max(leftHighlights.length, rightHighlights.length);
                for (let i = 0; i < pairCount; i++) {
                    const lh = leftHighlights[i];
                    const rh = rightHighlights[i];
                    if (!lh || !rh) continue; // require both to draw

                    const lRect = lh.getBoundingClientRect();
                    const rRect = rh.getBoundingClientRect();
                    const svgRect = sbsSvg.getBoundingClientRect();

                    const x1 = lRect.right - svgRect.left;
                    const y1 = lRect.top + lRect.height/2 - svgRect.top;
                    const x2 = rRect.left - svgRect.left;
                    const y2 = rRect.top + rRect.height/2 - svgRect.top;

                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const mx = (x1 + x2) / 2;
                    const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
                    path.setAttribute('d', d);
                    path.classList.add('sbs-path', type);
                    sbsSvg.appendChild(path);
                }
            });
        });
    }

    function setMode(mode) {
        const analysis = mode === 'analysis';

        comparisonSections.forEach(el => el.style.display = analysis ? '' : 'none');
        if (sbsView) {
            sbsView.classList.toggle('hidden', analysis);
            sbsView.setAttribute('aria-hidden', analysis ? 'true' : 'false');
        }

        modeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));

        if (!analysis) {
            buildSideBySide();
        } else {
            clearSvg();
        }
    }

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    if (toggleConnectors) {
        toggleConnectors.addEventListener('change', drawConnectors);
        window.addEventListener('resize', () => { if (!sbsView.classList.contains('hidden')) drawConnectors(); });
        window.addEventListener('scroll', () => { if (!sbsView.classList.contains('hidden')) drawConnectors(); }, { passive: true });
    }
});