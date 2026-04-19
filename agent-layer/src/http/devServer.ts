import "../loadRootEnv.js";
import { createHttpServer } from "./server.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const server = createHttpServer();

server.listen(port, () => {
  console.log(`Manual vision console: http://localhost:${port}/_manual/vision`);
});
