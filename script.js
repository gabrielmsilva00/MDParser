const $ = id => document.getElementById(id)
const markdown = $('markdown')
const preview = $('preview')
const filename = $('filename')
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

const generatePDF = async () => {
    const iframe = document.createElement('iframe')
    Object.assign(iframe.style, {
        position: 'absolute',
        top: '-9999px',
        width: '1100px',
        height: '100%',
        border: 'none'
    })
    
    document.body.appendChild(iframe)
    const doc = iframe.contentDocument || iframe.contentWindow.document
    const styles = getComputedStyle(document.body)
    
    doc.write(`
        <style>
            body{margin:0;padding:20px;font:14px system-ui,sans-serif;background:${styles.getPropertyValue('--bg')};color:${styles.getPropertyValue('--fg')}}
            pre{background:${styles.getPropertyValue('--code-bg')};border:1px solid ${styles.getPropertyValue('--code-border')};padding:16px;border-radius:6px}
            code{background:${styles.getPropertyValue('--code-bg')};padding:2px 4px;border-radius:3px}
            pre code{background:none;padding:0}
        </style>
        ${preview.innerHTML}
    `)
    doc.close()
    
    try {
        await html2pdf().set({
            margin: 0.5,
            filename: filename.value.replace('.md', '.pdf'),
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                letterRendering: true,
                useCORS: true,
                scrollY: -window.scrollY,
                windowWidth: 1100
            },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).from(doc.body).save()
    } finally {
        iframe.remove()
    }
}

const themes = ['theme-light', 'theme-dark', 'theme-black']
const themeButtons = document.querySelectorAll('.theme-opt')
let currentTheme = parseInt(localStorage.getItem('theme') || '1')

const applyTheme = (index) => {
    document.body.className = themes[index]
    themeButtons.forEach(btn => 
        btn.classList.toggle('active', parseInt(btn.dataset.theme) === index))
}

themeButtons.forEach(btn => 
    btn.onclick = () => {
        currentTheme = parseInt(btn.dataset.theme)
        localStorage.setItem('theme', currentTheme)
        applyTheme(currentTheme)
    })

saveBtn.onclick = saveFile
printBtn.onclick = generatePDF
markdown.oninput = updatePreview

markdown.value = initialContent
applyTheme(currentTheme)
updatePreview()
