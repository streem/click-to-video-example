import Streem from '@streem/sdk-node';
import express, { Request, Response } from 'express';
import StreemApi, { GroupReservation } from '../streem/api';
import { streemConfig } from '../env';

const router = express.Router();
const streemApi = StreemApi.instance();

interface CreateReservationBody {
    externalUserId: string;
    priority: number,
    details: { label: string; value: string }[];
}

type CreateReservationRequest = Request<{ groupName: string }, GroupReservation, CreateReservationBody>;

const getClientName = (externalUserId: string) => { return "John Smith" };

// Get a reservation
router.get('/:groupName/reservations/:reservationSid', async (req: Request, res: Response) => {
    const { groupName, reservationSid } = req.params;
    res.json(await streemApi.getReservation(streemConfig.companyCode, groupName, reservationSid));
});

// Create a reservation
router.post('/:groupName/reservations', async (req: CreateReservationRequest, res: Response) => {
    const { groupName } = req.params;

    // WARNING: This example is getting the externalUserId from the request body for simplicity.
    // We expects developers to use their system's auth setup to fetch client details like userIds.
    const { externalUserId, details } = req.body;

    const reservation = await streemApi.createReservation(
        streemConfig.companyCode,
        groupName,
        externalUserId,
        1 /* priority. Ensure this is lower than the priority value in re-join */,
        details,
    );
    res.json(reservation);
});

// Re-create a reservation with the highest priority to ensure this user jumps the queue.
router.post('/:groupName/reservations/rejoin', async (req: Request, res: Response) => {
    const { groupName } = req.params;
    const { reservationSid } = req.body;
    const initialReservation = await streemApi.getReservation(streemConfig.companyCode, groupName, reservationSid);

    const reservation = await streemApi.createReservation(
        streemConfig.companyCode,
        groupName,
        initialReservation.external_user_id,
        10 /* priority */,
        initialReservation.details!
    );
    res.json(reservation);
});

// Get a reservation token
// WARNING: Do not trust the client URL params (e.g., reservationId) for building tokens; specially in prod.
// We expects developers to use their system's auth setup to fetch client details reliably.
// This is just an example to show how to build a reservation token.
router.post(
    '/:groupName/reservations/:reservationSid/join-url',
    async (req: Request, res: Response) => {
        const { groupName, reservationSid } = req.params;
        const reservation = await streemApi.getReservation(streemConfig.companyCode, groupName, reservationSid)

        Streem.init(streemConfig.apiKeyId, streemConfig.apiKeySecret, `${streemConfig.apiEnv}-${streemConfig.apiRegion}`);
        const tokenBuilder = new Streem.TokenBuilder();
        tokenBuilder.userId = reservation['external_user_id'];
        tokenBuilder.name = getClientName(reservation['external_user_id']);
        tokenBuilder.reservationSid = reservationSid;
        const token = await tokenBuilder.build();

        const joinUrl = `https://${streemConfig.companyCode}.cv.${streemConfig.apiEnv}.streem.cloud/token#token=${token}`;
        res.json({ join_url:  joinUrl});
    },
);

router.post('/:groupName/reservations/:reservationSid/cancel',
    async (req: Request, res: Response) => {
        const { groupName, reservationSid } = req.params;
        await streemApi.cancelReservation(streemConfig.companyCode, groupName, reservationSid);
        res.json(await streemApi.getReservation(streemConfig.companyCode, groupName, reservationSid));
    },
);

export default router;
