import { IncomingMessage, ServerResponse } from 'http';
import { createHmac, timingSafeEqual } from 'crypto';
import { streemConfig } from '../env';

declare module 'http' {
    interface IncomingMessage {
        hasValidStreemSignature: Boolean;
    }
}

export function validateStreemSignature(req: IncomingMessage, res: ServerResponse, body: Buffer, encoding: string) {
    const hmac = createHmac('sha256', streemConfig.webhookSigningKey);

    // make sure the request is current
    const sentAt = req.headers['streem-sent-at'];
    if (typeof sentAt !== 'string') {
        throw new Error('"streem-sent-at" header not found in the request');
    }
    const sentAtDate = Date.parse(sentAt);
    if (isNaN(sentAtDate)) {
        throw new Error('"streem-sent-at" header is not a valid date');
    }

    const reqTimeSkew = Date.now() - sentAtDate
    const allowedSkew = 5000 // adjust timedelta (in ms) as desired
    if (reqTimeSkew > allowedSkew) {
        req.hasValidStreemSignature = false; // request is too far in the past
        return; 
    } else if (reqTimeSkew < -allowedSkew) {
        req.hasValidStreemSignature = false; // request is in the future
        return;
    }

    // Combine the headers and the request body to calculate the signature input message
    const signatureHeaders = req.headers['streem-signature-headers'];
    if (typeof signatureHeaders !== 'string') {
        throw new Error('"streem-signature-headers" header not found in the request');
    }
    const headerNames = signatureHeaders.split(':')
    headerNames.forEach(headerName => {
        const headerValue = req.headers[headerName.toLowerCase()];
        if (headerValue) {
            hmac.update(`${headerName}=${headerValue};`, 'utf-8');
        } else {
            throw new Error(`Header ${headerName} is missing`);
        }
    });
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');

    // validate that one of the signatures in the request matches the expected signature
    const streemSignature = req.headers['streem-signature'];
    if (typeof streemSignature !== 'string') {
        throw new Error('"streem-signature" header not found in the request');
    }
    const signatures = streemSignature.split(',').map(s => s.trim());
    const matchedSignature = signatures.find(signature => timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)));

    req.hasValidStreemSignature = !!matchedSignature;
}
