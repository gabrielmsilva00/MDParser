const editor = document.getElementById("editor")
const rendered = document.getElementById("rendered")
const fileNameInput = document.getElementById("fileName")
const saveFile = document.getElementById("saveFile")
const printPDF = document.getElementById("printPDF")

const colorTitle = document.getElementById("color-title")
const colorSubtitle = document.getElementById("color-subtitle")
const colorHeader = document.getElementById("color-header")
const colorList = document.getElementById("color-list")
const colorLink = document.getElementById("color-link")

const updatePreview = () => {
  const html = marked.parse(editor.value, { gfm: true, breaks: true })
  rendered.innerHTML = html
  document.querySelectorAll("pre code").forEach(block =>
    hljs.highlightElement(block)
  )
}

editor.addEventListener("input", updatePreview)

saveFile.addEventListener("click", () => {
  const blob = new Blob([editor.value], { type: "text/plain" })
  const a = document.createElement("a")
  a.href = URL.createObjectURL(blob)
  a.download = fileNameInput.value.trim() || "untitled.md"
  a.click()
})

printPDF.addEventListener("click", () => window.print())

// Load example markdown on startup
fetch("example.md")
  .then(res => res.text())
  .then(text => {
    editor.value = text
    updatePreview()
  })
  .catch(console.error)

// Update CSS custom properties when a color input changes
[
  { el: colorTitle, prop: "--title-color" },
  { el: colorSubtitle, prop: "--subtitle-color" },
  { el: colorHeader, prop: "--header-color" },
  { el: colorList, prop: "--list-color" },
  { el: colorLink, prop: "--link-color" }
].forEach(({ el, prop }) => {
  el.addEventListener("change", e => {
    document.documentElement.style.setProperty(prop, e.target.value)
  })
})

// Mobile tab switching logic
const tabEditor = document.getElementById("tabEditor")
const tabPreview = document.getElementById("tabPreview")
const container = document.getElementById("container")

if (tabEditor && tabPreview && container) {
  tabEditor.addEventListener("click", () => {
    container.classList.add("show-editor")
    container.classList.remove("show-preview")
    tabEditor.classList.add("active")
    tabPreview.classList.remove("active")
  })
  tabPreview.addEventListener("click", () => {
    container.classList.add("show-preview")
    container.classList.remove("show-editor")
    tabPreview.classList.add("active")
    tabEditor.classList.remove("active")
  })
  // Default to showing the editor on mobile.
  container.classList.add("show-editor")
}
