import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { SIGNING_KEY_SECRET } from '../routes/webhooks';

export function validateWebhookRequest(req: Request): Boolean {
    const hmac = createHmac('sha256', Buffer.from(SIGNING_KEY_SECRET, 'utf-8').toString());

    // make sure the request is current
    const sentAt = req.headers['streem-sent-at']! as string;
    const reqTimeSkew = Date.now() - Date.parse(sentAt)
    const allowedSkew = 500 // adjust timedelta (in ms) as desired
    if (reqTimeSkew > allowedSkew) {
        return false; // request is too far in the past 
    } else if (reqTimeSkew < -allowedSkew) {
        return false; // request is in the future
    }

    // calculate the signature input message
    const headerNames = (req.headers['streem-signature-headers']! as string).split(':')
    const headers: string[] = headerNames.map(headerName => {
        return `${headerName}=${req.headers[headerName.toLowerCase()]!}`;
    });
    const inputMsg = Buffer.from(`${headers.join(';')};`, 'utf-8').toString() + req.body;

    // calculate the signature
    const expectedSignature = hmac.update(inputMsg).digest('hex');

    // validate that one of the signatures in the request matches the expected signature
    const signatures = (req.headers['streem-signature']! as string).split(',').map(s => s.trim());
    const matchedSignature = signatures.find(signature => timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)));

    return !!matchedSignature;
}
