const $ = id => document.getElementById(id)
const markdown = $('markdown')
const preview = $('preview')
const filename = $('filename')
const themeIcons = ['✹', '✸', '✶']
let theme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 1 : 0)

marked.setOptions({
    highlight: (code, lang) => 
        Prism.languages[lang] ? Prism.highlight(code, Prism.languages[lang], lang) : code,
    breaks: true,
    gfm: true
})

const updatePreview = () => {
    preview.innerHTML = marked.parse(markdown.value)
    Prism.highlightAll()
}

const saveFile = () => {
    const blob = new Blob([markdown.value], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), {
        href: url,
        download: filename.value
    }).click()
    URL.revokeObjectURL(url)
}

const generatePDF = () => html2pdf().set({
    margin: [0.75, 0.75, 0.75, 0.75],
    filename: filename.value.replace('.md', '.pdf'),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, letterRendering: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
}).from(preview.cloneNode(true)).save()

const toggleTheme = () => {
    theme = (theme + 1) % 3
    document.body.className = theme === 2 ? 'theme-black' : ''
    localStorage.setItem('theme', theme)
    document.querySelector('.theme-toggle').textContent = themeIcons[theme]
}

markdown.value = `# Example Markdown Document...` // Your initial content here
markdown.addEventListener('input', updatePreview)
toggleTheme()
updatePreview()
