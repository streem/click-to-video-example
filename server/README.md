# Setup

## Create your `.env` file

```bash
cp .env.template .env
```

Then edit the `.env` file with your API Key ID and Secret. You need to set the STREEM_API_ENVIRONMENT, STREEM_API_REGION variables as well (e.g., "prod", "us" respectively).
Finally, set your COMPANY_CODE.

## Install dependencies and start the server

```bash
yarn install && yarn start
```

## Connect to the Streem webhooks

This example is setup to listen to Streem webhooks on the `/webhook-events` endpoint. If you havn't configure this already, you can follow these steps.

If you are running this locally, you can use a tool like [ngrok](https://ngrok.com/) to expose your local server to the internet.

* Assuming the default port of `3035`, you can run ngrok with:

```bash
ngrok http 3035
```

* Then point Streem to the Ngrok URL using the `Create Webhook` API.

For example, to point Streem to the `https://abc123.ngrok.app/webhook-events` endpoint, you can run:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"url":"https://abc123.ngrok.app/webhook-events"}' -s  http://localhost:3035/webhooks
```

## Disclaimer

Please note that your server might be exposed to the internet, especially if you are using a tool like ngrok. Make sure to secure your server and endpoints accordingly.
