const $ = id => document.getElementById(id)
const markdown = $('markdown')
const preview = $('preview')
const filename = $('filename')
const saveBtn = $('saveBtn')
const printBtn = $('printBtn')

marked.setOptions({
  breaks: true,
  gfm: true,
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
\`\`\`

## Images
![Markdown](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg)
`

const updatePreview = () => {
  preview.innerHTML = marked.parse(markdown.value)
  Prism?.highlightAll()
}

const saveFile = () => {
  const blob = new Blob([markdown.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: filename.value,
  }).click()
  URL.revokeObjectURL(url)
}

const generatePDF = async () => {
    const { jsPDF } = window.jspdf
    const pdf = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait',
    })
  
    const clonedPreview = preview.cloneNode(true)
    clonedPreview.style.fontSize = '12px'
    clonedPreview.style.lineHeight = '1.5'
    clonedPreview.style.width = '555px'
    clonedPreview.style.overflow = 'hidden'
  
    document.body.appendChild(clonedPreview)
  
    await pdf.html(clonedPreview, {
      x: 20,
      y: 20,
      html2canvas: {
        scale: 0.875,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      },
      margin: [20, 20, 20, 20],
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }, // Ensure page breaks respect CSS
      callback: () => {
        pdf.save(filename.value.replace('.md', '.pdf'))
        clonedPreview.remove()
      },
    })
  }

const themes = ['theme-light', 'theme-dark', 'theme-black']
const themeButtons = document.querySelectorAll('.theme-opt')
let currentTheme = parseInt(localStorage.getItem('theme') || '1')

const applyTheme = index => {
  document.body.className = themes[index]
  themeButtons.forEach(btn =>
    btn.classList.toggle('active', parseInt(btn.dataset.theme) === index)
  )
}

themeButtons.forEach(btn =>
  btn.onclick = () => {
    currentTheme = parseInt(btn.dataset.theme)
    localStorage.setItem('theme', currentTheme)
    applyTheme(currentTheme)
  }
)

const handleImageDrop = e => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result
        const altText = file.name.split('.')[0] // Use the file name as alt text
        const markdownImage = `![${altText}](${base64})`
        markdown.value += `\n\n${markdownImage}\n\n`
        updatePreview()
      }
      reader.readAsDataURL(file)
    }
  })
}

markdown.addEventListener('dragover', e => e.preventDefault())
markdown.addEventListener('drop', handleImageDrop)

saveBtn.onclick = saveFile
printBtn.onclick = generatePDF
markdown.oninput = updatePreview

markdown.value = initialContent
applyTheme(currentTheme)
updatePreview()