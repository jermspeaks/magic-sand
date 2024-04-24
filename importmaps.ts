const port = process.env.PORT || 7777;
const BASE_PATH = "./import-maps";

const server = Bun.serve({
  port,
  async fetch(req) {
    const path = new URL(req.url).pathname;

    // respond with text/html
    if (path === "/") return new Response(Bun.file("import-maps/index.html"));
    
    const filePath = BASE_PATH + new URL(req.url).pathname;
    return new Response(Bun.file(filePath));
  },
  error() {
    return new Response("Page not found", { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);
