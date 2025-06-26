#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const MARKDOWN_FILE = 'text.md';
const OUTPUT_FILE = 'index.html';

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Parse markdown content into slides
function parseMarkdown(content) {
  const lines = content.split('\n');
  const slides = [];
  let currentSlide = null;
  let inCodeBlock = false;
  let codeBlockContent = [];
  let codeBlockLang = '';
  
  for (let line of lines) {
    // Check for code blocks
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Starting a code block
        inCodeBlock = true;
        codeBlockLang = line.substring(3).trim();
        codeBlockContent = [];
      } else {
        // Ending a code block
        inCodeBlock = false;
        if (!currentSlide) {
          currentSlide = { type: 'content', content: [] };
        }
        currentSlide.content.push({
          type: 'code',
          language: codeBlockLang,
          text: codeBlockContent.join('\n')
        });
        codeBlockContent = [];
        codeBlockLang = '';
      }
      continue;
    }
    
    // If we're in a code block, collect the lines
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }
    
    // Skip certain metadata lines
    if (line.startsWith('slides:') || line.startsWith('Also share with')) {
      continue;
    }
    
    // Horizontal rule indicates slide break
    if (line.trim() === '<hr>' || line.trim() === '---') {
      if (currentSlide && currentSlide.content.length > 0) {
        slides.push(currentSlide);
      }
      currentSlide = null;
      continue;
    }
    
    // Main title (# Title)
    if (line.match(/^#\s+/)) {
      if (currentSlide && currentSlide.content.length > 0) {
        slides.push(currentSlide);
      }
      currentSlide = {
        type: 'title',
        title: line.replace(/^#\s+/, '').trim(),
        content: []
      };
      continue;
    }
    
    // Section title (## Title)
    if (line.match(/^##\s+/)) {
      if (currentSlide && currentSlide.content.length > 0) {
        slides.push(currentSlide);
      }
      currentSlide = {
        type: 'section',
        title: line.replace(/^##\s+/, '').trim(),
        content: []
      };
      continue;
    }
    
    // Section subtitle (### Title)
    if (line.match(/^###\s+/)) {
      if (!currentSlide) {
        currentSlide = { type: 'content', content: [] };
      }
      currentSlide.content.push({
        type: 'subtitle',
        text: line.replace(/^###\s+/, '').trim()
      });
      continue;
    }
    
    // List items
    if (line.startsWith('- ')) {
      if (!currentSlide) {
        currentSlide = { type: 'content', content: [] };
      }
      currentSlide.content.push({
        type: 'list-item',
        text: line.substring(2).trim()
      });
      continue;
    }
    
    // Key-value pairs (for stats)
    if (line.includes(':') && !line.startsWith('http') && !inCodeBlock) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      if (key && value && !key.includes(' ') && value.match(/[\d,]+/)) {
        if (!currentSlide) {
          currentSlide = { type: 'content', content: [] };
        }
        currentSlide.content.push({
          type: 'stat',
          key: key,
          value: value
        });
        continue;
      }
    }
    
    // Images
    if (line.match(/!\[([^\]]*)\]\(([^)]+)\)/)) {
      if (!currentSlide) {
        currentSlide = { type: 'content', content: [] };
      }
      const match = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      currentSlide.content.push({
        type: 'image',
        alt: match[1],
        src: match[2]
      });
      continue;
    }
    
    // Regular text
    if (line.trim()) {
      if (!currentSlide) {
        currentSlide = { type: 'content', content: [] };
      }
      currentSlide.content.push({
        type: 'text',
        text: line.trim()
      });
    }
  }
  
  // Don't forget the last slide
  if (currentSlide && currentSlide.content.length > 0) {
    slides.push(currentSlide);
  }
  
  return slides;
}

// Convert parsed slides to HTML
function generateHTML(slides) {
  const slideHTML = slides.map((slide, index) => {
    // Check if this is the pop quiz warning slide
    const isPopQuizWarning = slide.title && slide.title.toLowerCase().includes('pop quiz warning');
    
    let html = `    <div class="slide${slide.type === 'title' ? ' intro-slide' : ''}${isPopQuizWarning ? ' pop-quiz-warning' : ''}">\n`;
    html += `        <div class="content">\n`;
    
    if (slide.title) {
      if (slide.type === 'title') {
        html += `            <h1>${slide.title}</h1>\n`;
      } else {
        html += `            <h2>${slide.title}</h2>\n`;
      }
    }
    
    // Group content by type for better layout
    const stats = slide.content.filter(c => c.type === 'stat');
    const listItems = slide.content.filter(c => c.type === 'list-item');
    const texts = slide.content.filter(c => c.type === 'text');
    const subtitles = slide.content.filter(c => c.type === 'subtitle');
    const images = slide.content.filter(c => c.type === 'image');
    const codeBlocks = slide.content.filter(c => c.type === 'code');
    
    // Add divider for title slide
    if (slide.type === 'title' && texts.length > 0) {
      html += `            <div class="divider"></div>\n`;
    }
    
    // Add subtitles
    subtitles.forEach(item => {
      html += `            <h3>${item.text}</h3>\n`;
    });
    
    // Add stats in grid
    if (stats.length > 0) {
      html += `            <div class="stat-grid">\n`;
      stats.forEach(stat => {
        const value = stat.value;
        const hasPercentage = value.includes('(') && value.includes('%)');
        const mainValue = hasPercentage ? value.split('(')[0].trim() : value;
        const percentage = hasPercentage ? value.match(/\(([\d.]+%)\)/)[1] : null;
        
        html += `                <div class="stat-card">\n`;
        html += `                    <span class="big-number">${mainValue}</span>\n`;
        html += `                    <span>${stat.key.replace(/_/g, ' ')}</span>\n`;
        if (percentage) {
          html += `                    <span class="percentage">(${percentage})</span>\n`;
        }
        html += `                </div>\n`;
      });
      html += `            </div>\n`;
    }
    
    // Add list items
    if (listItems.length > 0) {
      // Check if items look like ranked items (contain — and numbers)
      const isRankedList = listItems.some(item => item.text.includes('—') && /\d+/.test(item.text));
      
      if (isRankedList && listItems.length <= 6) {
        // Use grid layout for top items
        html += `            <div class="top-list">\n`;
        listItems.forEach(item => {
          const parts = item.text.split('—').map(p => p.trim());
          if (parts.length === 2) {
            const [name, stats] = parts;
            const isLink = name.includes('](');
            const displayName = isLink ? name.match(/\[([^\]]+)\]/)[1] : name;
            const href = isLink ? name.match(/\(([^)]+)\)/)[1] : null;
            
            html += `                <div class="top-item">\n`;
            if (href) {
              html += `                    <a href="${href}" class="domain">${displayName}</a>\n`;
            } else {
              html += `                    <span style="color: #7878EF; font-weight: 700;">${displayName}</span>\n`;
            }
            html += `                    <span>${stats.replace(/(\d+,?\d*)/g, '<strong>$1</strong>')}</span>\n`;
            html += `                </div>\n`;
          }
        });
        html += `            </div>\n`;
      } else {
        // Regular list
        html += `            <ul>\n`;
        listItems.forEach(item => {
          let text = item.text;
          // Highlight ecosystem names or important terms
          text = text.replace(/^([^—]+)—/, '<span class="highlight">$1</span> —');
          text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '<span class="highlight">$1</span>');
          html += `                <li>${text}</li>\n`;
        });
        html += `            </ul>\n`;
      }
    }
    
    // Add text paragraphs
    texts.forEach(item => {
      html += `            <p>${item.text}</p>\n`;
    });
    
    // Add code blocks
    codeBlocks.forEach(item => {
      html += `            <pre class="code-block${item.language ? ' language-' + item.language : ''}"><code>${escapeHtml(item.text)}</code></pre>\n`;
    });
    
    // Add images
    images.forEach(item => {
      html += `            <img src="${item.src}" alt="${item.alt}" class="slide-image">\n`;
    });
    
    html += `        </div>\n`;
    html += `        <img src="favicon.png" alt="Logo" class="slide-logo">\n`;
    html += `        <span class="slide-number">${index + 1}/${slides.length}</span>\n`;
    html += `    </div>\n\n`;
    
    return html;
  }).join('');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The State of OSS Funding Data - ecosyste.ms</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #FFFFFF;
            color: #1D1D28;
            overflow-x: hidden;
            scroll-behavior: smooth;
            font-weight: 400;
        }
        
        .slide {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 3rem 2rem;
            position: relative;
            background: #FFFFFF;
        }
        
        .slide:nth-child(even) {
            background: #F5F5FF;
        }
        
        h1 {
            font-size: clamp(2.5rem, 6vw, 4rem);
            font-weight: 900;
            text-align: center;
            margin-bottom: 2rem;
            color: #7878EF;
            line-height: 1.1;
        }
        
        h2 {
            font-size: clamp(2rem, 5vw, 3rem);
            font-weight: 700;
            text-align: center;
            margin-bottom: 2rem;
            color: #1D1D28;
        }
        
        h3 {
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #5C5CCF;
        }
        
        .content {
            max-width: 1000px;
            width: 100%;
            text-align: center;
        }
        
        .stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
            justify-items: center;
        }
        
        .stat-card {
            background: #F5F5FF;
            border: 2px solid #DCDCE0;
            border-radius: 24px;
            padding: 2rem 1.5rem;
            transition: all 0.3s ease;
            min-width: 250px;
            max-width: 300px;
        }
        
        .stat-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 16px 32px rgba(120, 120, 239, 0.15);
            border-color: #BBBBFF;
        }
        
        .slide:nth-child(odd) .stat-card {
            background: #FFFFFF;
        }
        
        .big-number {
            font-size: 3rem;
            font-weight: 900;
            color: #45E56E;
            display: block;
            margin-bottom: 0.5rem;
        }
        
        .percentage {
            font-size: 1.8rem;
            font-weight: 700;
            color: #FF807D;
        }
        
        ul {
            list-style: none;
            text-align: left;
            max-width: 800px;
            margin: 0 auto;
        }
        
        li {
            margin: 0.8rem 0;
            padding: 0.8rem 0.8rem 0.8rem 2.5rem;
            position: relative;
            font-size: 1.2rem;
            line-height: 1.5;
            background: #F5F5FF;
            border-radius: 16px;
            transition: all 0.2s ease;
        }
        
        li:hover {
            background: #DCDCE0;
            transform: translateX(8px);
        }
        
        .slide:nth-child(even) li {
            background: #FFFFFF;
        }
        
        .slide:nth-child(even) li:hover {
            background: #F5F5FF;
        }
        
        li:before {
            content: "→";
            position: absolute;
            left: 0.8rem;
            color: #45E56E;
            font-size: 1rem;
            font-weight: 700;
        }
        
        .highlight {
            color: #7878EF;
            font-weight: 700;
        }
        
        .slide-number {
            position: absolute;
            bottom: 2rem;
            right: 2rem;
            color: #4C4C61;
            font-size: 0.9rem;
            font-weight: 400;
        }
        
        .slide-logo {
            position: absolute;
            bottom: 2rem;
            left: 2rem;
            width: 48px;
            height: 48px;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        
        .slide-logo:hover {
            opacity: 1;
        }
        
        .intro-slide p {
            font-size: 1.8rem;
            line-height: 1.8;
            color: #4C4C61;
            max-width: 900px;
            margin: 0 auto;
            font-weight: 400;
        }
        
        p {
            font-size: 1.6rem;
            line-height: 1.8;
            margin: 1.5rem 0;
        }
        
        .top-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        .top-item {
            background: #F5F5FF;
            border: 2px solid #BBBBFF;
            border-radius: 24px;
            padding: 1rem 1.2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.3s ease;
            font-size: 1.1rem;
        }
        
        .top-item:hover {
            background: #BBBBFF;
            transform: scale(1.02);
        }
        
        .domain {
            color: #7878EF;
            text-decoration: none;
            font-weight: 700;
        }
        
        .domain:hover {
            text-decoration: underline;
            color: #5C5CCF;
        }
        
        .nav-hint {
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%);
            color: #4C4C61;
            font-size: 0.9rem;
            animation: bounce 2s infinite;
            background: #F5F5FF;
            padding: 0.5rem 1.5rem;
            border-radius: 24px;
            border: 1px solid #DCDCE0;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-10px); }
        }
        
        .divider {
            width: 100px;
            height: 4px;
            background: linear-gradient(90deg, #7878EF, #45E56E);
            margin: 3rem auto;
            border-radius: 2px;
        }
        
        .stat-card span:not(.big-number):not(.percentage) {
            color: #4C4C61;
            font-weight: 400;
            font-size: 1.3rem;
        }
        
        .top-item span strong {
            color: #1D1D28;
            font-weight: 900;
        }
        
        a {
            transition: all 0.2s ease;
        }
        
        .reload-indicator {
            position: fixed;
            top: 1rem;
            right: 1rem;
            background: #45E56E;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 24px;
            font-size: 0.8rem;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .reload-indicator.show {
            opacity: 1;
        }
        
        .slide-image {
            max-width: 90%;
            max-height: 60vh;
            margin: 2rem auto;
            display: block;
            border-radius: 16px;
        }
        
        .slide-image[src="treemap.svg"],
        .slide-image[src="treemap-80percent.svg"] {
            border-radius: 0;
        }
        
        .code-block {
            background: #1D1D28;
            color: #F5F5FF;
            padding: 2rem;
            border-radius: 16px;
            overflow-x: auto;
            margin: 2rem auto;
            max-width: 90%;
            font-family: 'Courier New', Courier, monospace;
            font-size: 1.2rem;
            line-height: 1.6;
            box-shadow: 0 8px 32px rgba(29, 29, 40, 0.15);
            border: 2px solid #7878EF;
            text-align: left;
        }
        
        .code-block code {
            color: #F5F5FF;
            background: none;
            padding: 0;
            font-size: inherit;
            text-align: left;
            white-space: pre;
        }
        
        /* Pop Quiz Warning Slide Styles */
        .pop-quiz-warning {
            background: #FF807D !important;
            position: relative;
            overflow: hidden;
        }
        
        .pop-quiz-warning .content {
            position: relative;
            z-index: 1;
        }
        
        .pop-quiz-warning h1 {
            color: #FFFFFF;
            font-size: clamp(3rem, 7vw, 5rem);
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            animation: pulse 2s ease-in-out infinite;
        }
        
        .pop-quiz-warning .divider {
            background: linear-gradient(90deg, #FFFFFF, #FFE0DF);
        }
        
        .pop-quiz-warning p {
            color: #FFFFFF;
            font-size: 2rem;
            font-weight: 700;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        .pop-quiz-warning .slide-number {
            color: #FFFFFF;
        }
        
        .pop-quiz-warning .slide-logo {
            filter: brightness(0) invert(1);
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        @media (max-width: 768px) {
            .slide {
                padding: 2rem 1rem;
            }
            
            .stat-grid {
                grid-template-columns: 1fr;
            }
            
            .top-list {
                grid-template-columns: 1fr;
            }
            
            li {
                padding-left: 2.5rem;
            }
        }
    </style>
</head>
<body>
${slideHTML}    <div class="nav-hint">Scroll or use arrow keys to navigate • Press F for fullscreen</div>
    <div class="reload-indicator">Slides updated!</div>

    <script>
        // Fullscreen toggle
        function toggleFullscreen() {
            const elem = document.documentElement;
            
            if (!document.fullscreenElement && 
                !document.webkitFullscreenElement && 
                !document.mozFullScreenElement &&
                !document.msFullscreenElement) {
                // Enter fullscreen
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                } else if (elem.mozRequestFullScreen) {
                    elem.mozRequestFullScreen();
                } else if (elem.msRequestFullscreen) {
                    elem.msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const slides = document.querySelectorAll('.slide');
            const currentSlide = Math.round(window.scrollY / window.innerHeight);
            
            if (e.key === 'f' || e.key === 'F') {
                e.preventDefault();
                toggleFullscreen();
            } else if (e.key === 'Escape') {
                // Escape is handled automatically by browsers for fullscreen
            } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                if (currentSlide < slides.length - 1) {
                    slides[currentSlide + 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                if (currentSlide > 0) {
                    slides[currentSlide - 1].scrollIntoView({ behavior: 'smooth' });
                }
            } else if (e.key === 'Home') {
                e.preventDefault();
                slides[0].scrollIntoView({ behavior: 'smooth' });
            } else if (e.key === 'End') {
                e.preventDefault();
                slides[slides.length - 1].scrollIntoView({ behavior: 'smooth' });
            }
        });

        // Hide nav hint after first interaction
        let hasInteracted = false;
        const hideNavHint = () => {
            if (!hasInteracted) {
                hasInteracted = true;
                document.querySelector('.nav-hint').style.opacity = '0';
                setTimeout(() => {
                    document.querySelector('.nav-hint').style.display = 'none';
                }, 500);
            }
        };

        window.addEventListener('scroll', hideNavHint);
        document.addEventListener('keydown', hideNavHint);
        
        // Auto-reload when file changes
        let lastModified = ${Date.now()};
        setInterval(() => {
            fetch('/check-update?t=' + Date.now())
                .then(res => res.json())
                .then(data => {
                    if (data.modified > lastModified) {
                        lastModified = data.modified;
                        const indicator = document.querySelector('.reload-indicator');
                        indicator.classList.add('show');
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }
                })
                .catch(() => {}); // Ignore errors when not using the server
        }, 1000);
    </script>
</body>
</html>`;
}

// Generate slides from markdown
function generateSlides() {
  try {
    const markdown = fs.readFileSync(MARKDOWN_FILE, 'utf8');
    const slides = parseMarkdown(markdown);
    const html = generateHTML(slides);
    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`✓ Generated ${slides.length} slides in ${OUTPUT_FILE}`);
    return true;
  } catch (error) {
    console.error('Error generating slides:', error);
    return false;
  }
}

// Watch for changes
if (process.argv.includes('--watch')) {
  const http = require('http');
  const url = require('url');
  const { spawn } = require('child_process');
  
  // Initial generation
  generateSlides();
  
  // Watch for changes
  console.log(`Watching ${MARKDOWN_FILE} for changes...`);
  
  let lastModified = Date.now();
  
  // Also watch the script itself
  const scriptPath = __filename;
  console.log(`Also watching ${scriptPath} for changes...`);
  
  fs.watchFile(MARKDOWN_FILE, { interval: 500 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log('File changed, regenerating slides...');
      if (generateSlides()) {
        lastModified = Date.now();
      }
    }
  });
  
  // Simple server to check for updates
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    
    if (parsedUrl.pathname === '/check-update') {
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ modified: lastModified }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  server.listen(3456, () => {
    console.log('Update check server running on port 3456');
    console.log('\nOpen index.html in your browser.');
    console.log('Edit text.md and save to see changes automatically!');
  });
  
  // Watch the script itself for changes
  fs.watchFile(scriptPath, { interval: 500 }, (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log('\n✨ Script changed, restarting...\n');
      
      // Close the server before restarting
      server.close();
      
      // Spawn a new process with the same arguments
      const child = spawn(process.argv[0], process.argv.slice(1), {
        stdio: 'inherit',
        detached: true
      });
      
      // Detach the child and exit the current process
      child.unref();
      process.exit();
    }
  });
} else {
  // Just generate once
  generateSlides();
}