const $ = id => document.getElementById(id)
const markdown = $('markdown')
const preview = $('preview')
const filename = $('filename')
const themeBtn = $('themeBtn')
const saveBtn = $('saveBtn')
const printBtn = $('printBtn')

marked.setOptions({
    breaks: true,
    gfm: true
})

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
\`\`\``

const updatePreview = () => {
    preview.innerHTML = marked.parse(markdown.value)
    Prism?.highlightAll()
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
    margin: 0.5,
    filename: filename.value.replace('.md', '.pdf'),
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
}).from(preview).save()

const themeIcons = ['✹', '✸', '✶']
let theme = parseInt(localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? '1' : '0'))

const toggleTheme = () => {
    theme = (theme + 1) % 3
    document.body.className = theme === 2 ? 'theme-black' : ''
    localStorage.setItem('theme', theme)
    themeBtn.textContent = themeIcons[theme]
}

saveBtn.onclick = saveFile
printBtn.onclick = generatePDF
themeBtn.onclick = toggleTheme
markdown.oninput = updatePreview

markdown.value = initialContent
toggleTheme()
updatePreview()
