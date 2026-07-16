import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES = new Map([
  [".css", "text/css"],
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".json", "application/json"],
  [".png", "image/png"]
]);

function requestPath(root, requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error("Request escaped the static root.");
  }
  return target;
}

export async function startStaticServer(root) {
  const absoluteRoot = path.resolve(root);
  const server = createServer(async (request, response) => {
    try {
      let target = requestPath(absoluteRoot, request.url);
      if ((await stat(target)).isDirectory()) target = path.join(target, "index.html");
      response.writeHead(200, {
        "content-type": CONTENT_TYPES.get(path.extname(target)) ??
          "application/octet-stream"
      });
      response.end(await readFile(target));
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}/`,
    close: () => new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    })
  };
}
