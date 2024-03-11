import express from "express";
import cors from "cors";
import { Store } from "./src/store";
import { Server } from "./src/server";
import { checkJwt, authzMiddleware } from "./src/auth";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { join, dirname } from "path";

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenvExpand.expand(dotenv.config());

// establish whether we are hosted in Netlify
const isNetlify = process.env.NETLIFY || process.env.REACT_APP_NETLIFY;

const app: express.Application = express();
const router = express.Router();
const routerBasePath = isNetlify ? '/.netlify/functions/index' : '/';

app.use(express.json());
app.use(cors());

const PORT = 3001;

Store.open().then((store) => {
  const server = new Server(store);
  const checkAuthz = authzMiddleware(store);

  router.get("/users/:userID", checkJwt, checkAuthz('can_read_user'), server.getUser.bind(server));
  router.get("/todos", checkJwt, checkAuthz('can_read_todos'), server.list.bind(server));
  router.post("/todos", checkJwt, checkAuthz('can_create_todo'), server.create.bind(server));
  router.put("/todos/:id", checkJwt, checkAuthz('can_update_todo'), server.update.bind(server));
  router.delete("/todos/:id", checkJwt, checkAuthz('can_delete_todo'), server.delete.bind(server));

  // configure the router on the correct base path
  app.use(routerBasePath, router);

  // make it work with netlify functions
  if (isNetlify) {
    const serverless = require("serverless-http");
    exports.handler = serverless(app);
  } else {
    // main endpoint serves react bundle from /build
    app.use(express.static(join(__dirname, '..', 'build')));

    app.listen(PORT, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
  }
});
