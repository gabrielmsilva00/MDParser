const markdown = document.getElementById("markdown");
const preview = document.getElementById("preview");
const filename = document.getElementById("filename");

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

const updatePreview = () => {
  const content = markdown.value;
  preview.innerHTML = marked.parse(content);
  Prism.highlightAll();
};

markdown.addEventListener("input", updatePreview);

const saveFile = () => {
  const content = markdown.value;
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.value;
  a.click();
  URL.revokeObjectURL(url);
};

const generatePDF = () => {
  const element = preview.cloneNode(true);
  const opt = {
    margin: 1,
    filename: filename.value.replace(".md", ".pdf"),
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
  };
  html2pdf().set(opt).from(element).save();
};

const themes = ["theme-light", "theme-dark", "theme-black"];
let currentTheme = 0;

const toggleTheme = () => {
  currentTheme = (currentTheme + 1) % themes.length;
  document.body.className = themes[currentTheme];
};

markdown.value = `# Welcome to Markdown Parser

## Features
- GitHub Flavored Markdown
- Syntax highlighting
- Dark mode toggle
- PDF export
- File saving

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`
`;

updatePreview();
