# OSS Funding Data Slideshow

This project automatically generates an HTML slideshow from a markdown file.

## Credits

- **Slide generator code**: Written by [Claude Code](https://claude.ai/code)
- **Slide content**: Hand-written by Andrew Nesbitt

## Usage

### One-time generation:
```bash
node generate-slides.js
```

### Watch mode (auto-regenerates on file changes):
```bash
npm start
# or
npm run watch
# or
node generate-slides.js --watch
```

## How it works

1. Edit `text.md` with your presentation content
2. The script watches for changes and regenerates `index.html`
3. Open `index.html` in your browser
4. The browser will auto-reload when slides are updated

## Markdown formatting

The generator recognizes these patterns:

### Slide breaks:
- `<hr>` or `---` creates a new slide
- `#` headers create title slides
- `##` headers create section slides

### Content types:
- `### Subtitle` - Creates a subtitle within a slide
- `- List item` - Creates styled list items
- `key: value` - Creates stat cards (for numeric data)
- `![alt text](image.png)` - Adds images
- Regular text becomes paragraphs

### Example:
```markdown
# Main Title
This is the intro text for the title slide.

<hr>

## Section Title
- First point
- Second point
- Third point

<hr>

## Statistics
Total packages: 9,080,774
Active users: 150,926
Success rate: 92.5%

<hr>

## Chart Example
Here's our growth over time:

![Growth Chart](chart.png)
```

## Navigation

- **Arrow keys** (↑↓) or **Page Up/Down** to navigate
- **Space** for next slide
- **Home/End** to jump to first/last slide
- **F** to toggle fullscreen mode
- **Escape** to exit fullscreen

## Features

- Auto-reload when markdown changes
- Responsive design
- ecosyste.ms branded styling
- Smooth scrolling between slides

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

[![CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)