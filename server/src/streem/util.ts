import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { SIGNING_KEY_SECRET } from '../routes/webhooks';

export function validateWebhookRequest(req: Request): Boolean {
    const hmac = createHmac('sha256', Buffer.from(SIGNING_KEY_SECRET, 'utf-8').toString());

    // make sure the request is current
    const sent_at = req.headers['streem-sent-at']! as string;
    const req_time_skew = Date.now() - Date.parse(sent_at)
    const allowed_skew = 500 // adjust timedelta (in ms) as desired
    if (req_time_skew > allowed_skew) {
        return false; // request is too far in the past 
    } else if (req_time_skew < -allowed_skew) {
        return false; // request is in the future
    }

    // calculate the signature input message
    const header_names = (req.headers['streem-signature-headers']! as string).split(':')
    const headers: string[] = header_names.map(header_name => {
        return `${header_name}=${req.headers[header_name.toLowerCase()]!}`;
    });
    const input_msg = Buffer.from(`${headers.join(';')};`, 'utf-8').toString() + JSON.stringify(req.body);

    // calculate the signature
    const expected_signature = hmac.update(input_msg).digest('hex');

    // validate that one of the signatures in the request matches the expected signature
    const signatures = (req.headers['streem-signature']! as string).split(',').map(s => s.trim());
    const matched_signature = signatures.find(signature => timingSafeEqual(Buffer.from(signature), Buffer.from(expected_signature)));

    return matched_signature !== undefined;
}
