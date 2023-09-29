import express, { Request, Response } from 'express';
import StreemApi, { WebhookSigningKey } from '../streem/api';
import { streemConfig } from '../env';

const router = express.Router();
const streemApi = StreemApi.instance();
// WARNING: use a secured store for signing keys in production. This is just for demo purposes.
export const SIGNING_KEY_SECRET = 'ClickToVideo Example Signing Key Secret';

router.get('/:webhookSid', async (req: Request, res: Response) => {
    const { webhookSid } = req.params;
    res.json(await streemApi.getWebhook(webhookSid));
});

router.post('/', async (req: Request, res: Response) => {
    const { url } = req.body;

    const company = await streemApi.getCompany(streemConfig.companyCode)
    const webhook = await streemApi.createWebhook(
        company.sid,
        url,
        "Click To Video Example Webhook",
        "POST",
        5000,
        5
    );
    const signingKey: WebhookSigningKey = await streemApi.createWebhookSigningKey(
        webhook.sid,
        SIGNING_KEY_SECRET,
    );

    res.json({ webhook, signingKey });
});

router.delete('/:webhookSid', async (req: Request, res: Response) => {
    const { webhookSid } = req.params;
    res.json(await streemApi.deleteWebhook(webhookSid));
});

export default router;
