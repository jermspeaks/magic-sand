import { file, FileSystemRouter, serve } from "bun";

const router = new FileSystemRouter({
  style: "nextjs",
  dir: import.meta.dir + "/pages",
});
console.log(router);

const server = serve({
  port: 5432,
  fetch(req) {
    const now = new Date().toISOString();

    try {
      const status = 200;
      const path = new URL(req.url).pathname;
      const staticFile = file(import.meta.dir + path);

      console.log(`${now} - [${status}] ${req.url}`);
      return new Response(staticFile, { status: 200 });
    } catch (e) {
      const status = 404;
      console.log(`${now} - [${status}] ${req.url}`);
      return new Response("Not found", { status });
    }

    // let match = router.match(req);

    // if (!match?.filePath) {
    //   const status = match?.status ?? 404;
    //   console.log(`${now} - [${status}] ${req.url}`);
    //   return new Response("Not found", { status: 404 });
    // }

    // const status = match?.status ?? 200;
    // console.log(`${now} - [${status}] ${req.url}`);
    // let page = require(match?.filePath);
    // return new page(req, match?.query, match?.params);
  },
});

console.log(`Listening on ${server.url}`);
