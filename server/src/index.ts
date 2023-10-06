import express, { Express } from 'express';
import { serverConfig } from './env';
import cors from 'cors';
import routes from './routes';
import { clientEventsHandler, streemEventsHandler } from './events';

const app: Express = express();

app.use(cors());

// Endpoint for the group reservation operations
app.use('/groups', express.json(), routes.groups);

// Endpoint for configuring a Streem webhook. Only used for first time setup.
app.use('/webhooks', express.json(), routes.webhooks);

// Endpoint to maintain an open connection with the client's browser
app.get('/events/g/:groupName/r/:reservationSid', express.json(), clientEventsHandler);

// Endpoint to receive and process Streem webhooks callbacks
// Keep the raw body buffer for signature checks
app.post("/webhook-events", express.raw({type: 'application/json'}), streemEventsHandler);

app.listen(serverConfig.port, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${serverConfig.port}`);
});
