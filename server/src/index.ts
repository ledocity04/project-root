import http from "http";
import { app } from "./app.js";
import { config } from "./config.js";
import { initSocket } from "./socket.js";

const server = http.createServer(app);
initSocket(server);

server.listen(config.PORT, () => {
  console.log(`Server listening on http://localhost:${config.PORT}`);
});
