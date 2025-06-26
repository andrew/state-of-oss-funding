# The State of OSS Funding Data

**Insights from ecosyste.ms**

A presentation by Andrew Nesbitt for CHAOSScon North America 2025, Denver, CO.

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

## License

This work is licensed under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

[![CC BY-SA 4.0](https://licensebuttons.net/l/by-sa/4.0/88x31.png)](http://creativecommons.org/licenses/by-sa/4.0/)