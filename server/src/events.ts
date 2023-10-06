import { Request, Response } from 'express';
import { GroupReservation } from './streem/api';
import StreemApi from './streem/api';
import { validateWebhookRequest } from './streem/util';
import { streemConfig } from './env';

const streemApi = StreemApi.instance();

interface GroupReservationUpdated {
    previous_group_reservation: GroupReservation;
    updated_group_reservation: GroupReservation;
}

let clientEventResponses: { reservationSid: string, timestamp: number, res: Response } [] = [];

const sendUpdateToClients = (updatedReservation: GroupReservation) => {
    clientEventResponses
        .filter((clientEventResponse) => { return clientEventResponse.reservationSid === updatedReservation.reservation_sid })
        .forEach((clientEventResponse) => {
            clientEventResponse.res.write(`data: ${JSON.stringify(updatedReservation)}\n\n`);
        });
}

const getGroupReservation = async (groupName: string, reservationSid: string) => {
    return await streemApi.getReservation(streemConfig.companyCode, groupName, reservationSid);
}

// Server side event handler
// This keep a client connection alive; so it is used to forward the Streem webhooks events to the client.
export async function clientEventsHandler (req: Request, res: Response) {
    const { groupName, reservationSid } = req.params;
    const newClientEventResponse = {
      reservationSid: reservationSid,
      timestamp: Date.now(),
      res
    };
    clientEventResponses.push(newClientEventResponse);

    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    newClientEventResponse.res.writeHead(200, headers);

    const groupReservation = await getGroupReservation(groupName, reservationSid);
    newClientEventResponse.res.write(`data: ${JSON.stringify(groupReservation)}\n\n`);

    req.on("close", () => {
        if (!newClientEventResponse.res.writableEnded) {
            newClientEventResponse.res.end();
            // Remove it from the list
            clientEventResponses = clientEventResponses.filter(resp => resp.timestamp != newClientEventResponse.timestamp);
        }
    });
}

// Streem webhooks handler
export function streemEventsHandler (req: Request, res: Response) {
    const isValid = validateWebhookRequest(req);
    if (!isValid) {
        console.log('Invalid webhook request ', req.headers, req.body);
        res.status(401).end();
        return;
    }

    const { event } = JSON.parse(req.body);

    if (event?.event_type === 'group_reservation_updated') {
        const updatedReservation = (event.payload as GroupReservationUpdated).updated_group_reservation;

        sendUpdateToClients(updatedReservation);
    }

    res.status(200).end()
}
