# Setup

* Create your `.env` file:

```
cp .env.template .env
```

Then edit the `.env` file with your server endpoint.

* Install dependencies and start the server:

```
yarn install && yarn start
```

This will open your web browser to the example app.

## Custom Redirect URL

Once the call is completed, the user can be redirected to a custom URL. This URL can be set in your company settings.
To redirect to this sample app, assuming you are using the default port of `3001`, you can set the redirect URL to `http://localhost:3001/call-redirect`.
