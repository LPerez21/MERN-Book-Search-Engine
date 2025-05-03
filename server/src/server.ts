// server/src/server.ts
import express, { Request, Response } from 'express';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import db from './config/connection.js';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { authMiddleware } from './services/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

async function startApolloServer() {
  // 1. Initialize ApolloServer with your schema and auth context
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });
  await server.start();

  // 2. Apply Express middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Mount GraphQL on /graphql (cast to any to satisfy types)
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  // 4. Serve React build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  // 5. Connect to MongoDB and start listening
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(
        `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
}

startApolloServer();
