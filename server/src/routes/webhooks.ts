import express, { Request, Response } from 'express';
import StreemApi, { WebhookSigningKey } from '../streem/api';
import { streemConfig } from '../env';

const router = express.Router();
const streemApi = StreemApi.instance();

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
        streemConfig.webhookSigningKey
    );

    res.json({ webhook, signingKey });
});

router.delete('/:webhookSid', async (req: Request, res: Response) => {
    const { webhookSid } = req.params;
    res.json(await streemApi.deleteWebhook(webhookSid));
});

export default router;
