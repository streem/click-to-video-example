import express, { Express } from 'express';
import 'express-async-errors';
import { serverConfig } from './env';
import cors from 'cors';
import routes from './routes';
import { clientEventsHandler, streemEventsHandler } from './events';

const app: Express = express();

app.use(cors());
app.use(express.json());

// Endpoint for the group reservation operations
app.use('/groups', routes.groups);

// Endpoint for configuring a Streem webhook. Only used for first time setup.
app.use('/webhooks', routes.webhooks);

// Endpoint to maintain an open connection with the client's browser
app.get('/events/g/:groupName/r/:reservationSid', clientEventsHandler);

// Endpoint to receive and process Streem webhooks callbacks
app.post("/webhook-events", streemEventsHandler);

app.listen(serverConfig.port, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${serverConfig.port}`);
});
