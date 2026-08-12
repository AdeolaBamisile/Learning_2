const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/use/ws");
const { ApolloServer } = require("@apollo/server");
const jwt = require("jsonwebtoken");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { expressMiddleware } = require("@as-integrations/express5");
const cors = require("cors");
const express = require("express");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const http = require("http");
const path = require("path");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const User = require("./models/user");

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith("bearer ")) {
    return null;
  }

  const decodedToken = jwt.verify(auth.substring(7), process.env.TOKENKEY);
  return User.findById(decodedToken.id).populate("friends");
};

const startServer = async (port) => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization;
        const currentUser = await getUserFromAuthHeader(auth);
        return { currentUser };
      },
    }),
  );

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("/*splat", (request, response) => {
      response.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
  }

  httpServer.listen(port, () =>
    console.log(`Server running at http://localhost:${port}`),
  );
};

module.exports = startServer;
