// Initialize marked with options
marked.setOptions({
  highlight: (code, lang) => Prism.languages[lang] ? 
      Prism.highlight(code, Prism.languages[lang], lang) : code,
  breaks: true,
  gfm: true
});

// DOM Elements
const elements = {
  markdown: document.getElementById('markdown'),
  preview: document.getElementById('preview'),
  filename: document.getElementById('filename'),
  themeToggle: document.getElementById('themeToggle'),
  saveBtn: document.getElementById('saveBtn'),
  printBtn: document.getElementById('printBtn')
};

// Theme Configuration
const themeConfig = {
  icons: ['✹', '✸', '✶'],
  classes: ['theme-light', 'theme-dark', 'theme-black'],
  current: parseInt(localStorage.getItem('theme')) || 0
};

// Event Handlers
const handlers = {
  updatePreview: debounce(() => {
      elements.preview.innerHTML = marked.parse(elements.markdown.value);
      Prism.highlightAll();
  }, 150),

  saveFile: () => {
      const blob = new Blob([elements.markdown.value], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = elements.filename.value;
      a.click();
      URL.revokeObjectURL(url);
  },

  generatePDF: async () => {
      const element = elements.preview.cloneNode(true);
      const opt = {
          margin: [0.75, 0.75, 0.75, 0.75],
          filename: elements.filename.value.replace('.md', '.pdf'),
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
  },

  toggleTheme: () => {
      themeConfig.current = (themeConfig.current + 1) % themeConfig.classes.length;
      localStorage.setItem('theme', themeConfig.current);
      applyTheme();
  }
};

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
      const later = () => {
          clearTimeout(timeout);
          func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
}

function applyTheme() {
  document.body.className = themeConfig.classes[themeConfig.current];
  elements.themeToggle.textContent = themeConfig.icons[themeConfig.current];
}

// Event Listeners
elements.markdown.addEventListener('input', handlers.updatePreview);
elements.saveBtn.addEventListener('click', handlers.saveFile);
elements.printBtn.addEventListener('click', handlers.generatePDF);
elements.themeToggle.addEventListener('click', handlers.toggleTheme);

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  elements.markdown.value = `/* Your example markdown */`;
  handlers.updatePreview();
});
