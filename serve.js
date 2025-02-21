import { serve } from "bun"

const port = 3000
console.log(`Server listening on http://localhost:${port}`)

serve({
  port,
  fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname === "/" ? "/index.html" : url.pathname
    try {
      const file = Bun.file(`.${path}`)
      return new Response(file)
    } catch (e) {
      return new Response("Not Found", { status: 404 })
    }
  }
})
