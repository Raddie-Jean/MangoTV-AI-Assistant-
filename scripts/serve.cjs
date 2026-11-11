const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve(__dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const target = path.resolve(
      root,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (
      !target.startsWith(root + path.sep) ||
      target.split(path.sep).includes(".git")
    ) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    fs.readFile(target, (error, data) => {
      if (error) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(target)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(data);
    });
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
server.listen(Number(process.env.PORT || 4173), "127.0.0.1", () =>
  console.log("Demo: http://127.0.0.1:" + server.address().port),
);
