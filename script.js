class MarkdownEditor {
  constructor() {
      this.elements = {
          markdown: document.getElementById('markdown'),
          preview: document.getElementById('preview'),
          filename: document.getElementById('filename'),
          themeToggle: document.getElementById('themeToggle'),
          saveBtn: document.getElementById('saveBtn'),
          printBtn: document.getElementById('printBtn')
      };

      this.config = {
          themes: ['theme-light', 'theme-dark', 'theme-black'],
          themeIcons: ['✹', '✸', '✶'],
          currentTheme: parseInt(localStorage.getItem('theme')) || 0,
          defaultContent: this.getDefaultContent()
      };

      this.init();
  }

  init() {
      this.setupMarked();
      this.setupEventListeners();
      this.loadInitialContent();
      this.applyTheme();
  }

  setupMarked() {
      marked.setOptions({
          highlight: (code, lang) => {
              if (Prism.languages[lang]) {
                  return Prism.highlight(code, Prism.languages[lang], lang);
              }
              return code;
          },
          breaks: true,
          gfm: true
      });
  }

  setupEventListeners() {
      // Debounced preview update
      let timeout;
      this.elements.markdown.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => this.updatePreview(), 150);
      });

      this.elements.saveBtn.addEventListener('click', () => this.saveFile());
      this.elements.printBtn.addEventListener('click', () => this.generatePDF());
      this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

      // Auto-save content to localStorage
      window.addEventListener('beforeunload', () => {
          localStorage.setItem('markdown-content', this.elements.markdown.value);
      });
  }

  updatePreview() {
      const content = this.elements.markdown.value;
      this.elements.preview.innerHTML = marked.parse(content);
      Prism.highlightAll();
  }

  async saveFile() {
      try {
          const blob = new Blob([this.elements.markdown.value], { type: 'text/markdown' });
          const handle = await window.showSaveFilePicker({
              suggestedName: this.elements.filename.value,
              types: [{
                  description: 'Markdown files',
                  accept: { 'text/markdown': ['.md'] }
              }]
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
      } catch (err) {
          // Fallback for browsers that don't support File System Access API
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = this.elements.filename.value;
          a.click();
          URL.revokeObjectURL(url);
      }
  }

  async generatePDF() {
      const element = this.elements.preview.cloneNode(true);
      const opt = {
          margin: [0.75, 0.75, 0.75, 0.75],
          filename: this.elements.filename.value.replace('.md', '.pdf'),
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
              scale: 2,
              letterRendering: true,
              useCORS: true
          },
          jsPDF: { 
              unit: 'in', 
              format: 'letter', 
              orientation: 'portrait'
          }
      };
      await html2pdf().set(opt).from(element).save();
  }

  toggleTheme() {
      this.config.currentTheme = (this.config.currentTheme + 1) % this.config.themes.length;
      this.applyTheme();
      localStorage.setItem('theme', this.config.currentTheme);
  }

  applyTheme() {
      document.body.className = this.config.themes[this.config.currentTheme];
      this.elements.themeToggle.textContent = this.config.themeIcons[this.config.currentTheme];
  }

  loadInitialContent() {
      const savedContent = localStorage.getItem('markdown-content');
      this.elements.markdown.value = savedContent || this.config.defaultContent;
      this.updatePreview();
  }

  getDefaultContent() {
      return `# Example Markdown Document\n\n...`; // Your existing default content
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.editor = new MarkdownEditor();
});
