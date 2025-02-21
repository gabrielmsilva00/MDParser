// Initialize elements and settings
const markdown = document.getElementById("markdown");
const preview = document.getElementById("preview");
const filename = document.getElementById("filename");
const themeToggle = document.querySelector('.theme-toggle');
const themeIcons = ["✹", "✸", "✶"];
const themes = ["theme-light", "theme-dark", "theme-black"];

// Markdown configuration
marked.setOptions({
    highlight: (code, lang) => {
        if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
        }
        return code;
    },
    breaks: true,
    gfm: true,
});

// Theme management
let currentTheme = parseInt(localStorage.getItem('theme') || '0');

function applyTheme() {
    document.body.className = themes[currentTheme];
    themeToggle.textContent = themeIcons[currentTheme];
}

function toggleTheme() {
    currentTheme = (currentTheme + 1) % themes.length;
    localStorage.setItem('theme', currentTheme.toString());
    applyTheme();
}

// Preview update function
function updatePreview() {
    const content = markdown.value;
    preview.innerHTML = marked.parse(content);
    Prism.highlightAll();
}

// File operations
function saveFile() {
    const content = markdown.value;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.value;
    a.click();
    URL.revokeObjectURL(url);
}

function generatePDF() {
  const element = preview.cloneNode(true);
  
  // Add specific styles for PDF generation
  const style = document.createElement('style');
  style.textContent = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      pre { background-color: #f6f8fa !important; padding: 16px; border-radius: 6px; overflow-x: auto; }
      code { font-family: monospace; }
      .token.comment { color: #6a737d; }
      .token.keyword { color: #d73a49; }
      .token.string { color: #032f62; }
      .token.function { color: #6f42c1; }
      .token.number { color: #005cc5; }
  `;
  element.prepend(style);

  const opt = {
      margin: [0.75, 0.75, 0.75, 0.75],
      filename: filename.value.replace(".md", ".pdf"),
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
          scale: 2,
          letterRendering: true,
          useCORS: true,
          logging: false,
          windowWidth: 1200 // Force desktop-like rendering
      },
      jsPDF: { 
          unit: "in", 
          format: "letter", 
          orientation: "portrait"
      }
  };

  // Force light theme styles for PDF
  element.querySelectorAll('pre, code').forEach(block => {
      block.style.backgroundColor = '#f6f8fa';
      block.style.color = '#24292e';
  });

  html2pdf().set(opt).from(element).save();
}

// Initial content
const initialContent = `# Example Markdown Document

Welcome to the **Custom Markdown Editor**. This editor supports _all_ of the standard GitHub-flavored
Markdown features.

---

## Basic Text Formatting

This is a regular paragraph demonstrating **bold**, _italic_ and \`inline code\`.  
You can also combine **bold** with *italic* if needed.

## Headings

Below are examples of headings from level 1 to 6:

# Heading Level 1
## Heading Level 2
### Heading Level 3
#### Heading Level 4
##### Heading Level 5
###### Heading Level 6

## Lists

### Unordered List

- Item 1
- Item 2
  - Nested Item 2a
  - Nested Item 2b
- Item 3

### Ordered List

1. First item
2. Second item
   1. Subitem one
   2. Subitem two
3. Third item

## Blockquotes

> This is a blockquote example.  
> It can span multiple lines and include **bold text** or other *styling*.

## Code Blocks

Here is a JavaScript example:

\`\`\`js
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}
console.log(fibonacci(10))
\`\`\``;

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set initial content
    markdown.value = initialContent;
    
    // Apply initial theme
    applyTheme();
    
    // Set up event listeners
    markdown.addEventListener('input', updatePreview);
    
    // Initial preview update
    updatePreview();
});
