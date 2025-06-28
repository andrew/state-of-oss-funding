# The State of OSS Funding Data

**Insights from ecosyste.ms**

A presentation by Andrew Nesbitt for CHAOSScon North America 2025, Denver, CO.

📄 **[View PDF](./slides.pdf)** 

## Abstract

This talk explores the current state of funding in open source software, analyzing data from over 11 million packages across various ecosystems. Using the ecosyste.ms dataset, we examine:

- How many packages have funding links
- Which funding platforms are most popular
- The concentration of funding in critical packages
- Who maintains critical infrastructure
- The relationship between funding success and package maintenance

## Key Findings

- Only **3.26%** of all packages have funding links
- **72.8%** of critical packages have no obvious way to financially support them
- **35%** of critical packages are maintained by individuals, not organizations
- Well-funded maintainers tend to maintain more critical packages, creating a concentration effect
- GitHub Sponsors and Open Collective dominate the funding platform landscape

## Data Sources

All data presented comes from the [ecosyste.ms](https://ecosyste.ms) project, which tracks:
- 11.4M packages
- 262M repositories  
- 1.7M maintainers
- 22B dependencies

## Links

- **Slides**: https://github.com/andrew/state-of-oss-funding
- **ecosyste.ms**: https://ecosyste.ms
- **Funding data**: https://packages.ecosyste.ms/funding
- **Critical packages**: https://packages.ecosyste.ms/critical

## Credits

- **Talk content**: Hand-written by Andrew Nesbitt
- **Slide generator**: Written by [Claude Code](https://claude.ai/code)

---

## Slide Generator

This repository includes an HTML slide generator that creates presentations from markdown files.

### Running the slides

To view the slides locally:

```bash
# Install dependencies
npm install

# Generate and watch for changes
npm start
```

Then open `index.html` in your browser.

### Usage

- Edit `text.md` to modify slide content
- The generator watches for changes and auto-reloads
- See formatting guide in `generate-slides.js` comments

### Navigation

- **Arrow keys** (↑↓) or **Page Up/Down** to navigate
- **Space** for next slide
- **F** to toggle fullscreen
- **Home/End** to jump to first/last slide

### Exporting to PDF

#### Option 1: Browser Print (Recommended)
1. Open `index.html` in Chrome or Edge
2. Press `Cmd+P` (Mac) or `Ctrl+P` (Windows/Linux)
3. Change settings:
   - Destination: "Save as PDF"
   - Layout: Portrait
   - Margins: None
   - Scale: Default (100%)
   - Options: Check "Background graphics"
4. Click "Save"

#### Option 2: Automated Export
```bash
# Using Puppeteer (requires Node.js)
npm install -g puppeteer-cli
puppeteer print index.html slides.pdf --format A4 --margin-top 0 --margin-bottom 0 --margin-left 0 --margin-right 0

# Using headless Chrome directly
google-chrome --headless --disable-gpu --print-to-pdf=slides.pdf index.html

# On macOS with Chrome installed
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --print-to-pdf=slides.pdf index.html
```

#### Option 3: Decktape (Best for presentations)
```bash
# Install decktape
npm install -g decktape

# Export with automatic slide detection
decktape generic --slides 1 index.html slides.pdf
```

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

[![CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)