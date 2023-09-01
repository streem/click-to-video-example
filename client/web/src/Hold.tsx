import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { serverConfig } from './env';
import { GroupName } from './groups';


export default function Hold() {
    const { reservationSid } = useParams<{reservationSid: string}>();
    const [reservationStatus, setReservationStatus] = useState<string>();
    const [queuePosition, setQueuePosition] = useState<number>();
    const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>();
    const history = useHistory();

    useEffect(() => {
        const eventSource = new EventSource(`${serverConfig.endpoint}/events/g/${GroupName.DEFAULT}/r/${reservationSid}`);
        eventSource.onmessage = (event) => {
            const reservation = JSON.parse(event.data);
            console.log("Hold page: ", reservation);

            setReservationStatus(reservation['reservation_status']);
            setQueuePosition(reservation['queue_position']);
            if (reservation['estimated_wait_until']) {
                setInterval(() => {
                    setEstimatedWaitTime(Math.round((Date.parse(reservation['estimated_wait_until']) - Date.now()) / (60 * 1000)));
                }, 5000);
            }
        };
    }, [reservationSid, history]);

    useEffect(() => {
        switch(reservationStatus) { 
            case 'GROUP_RESERVATION_STATUS_MATCHED': { 
                history.push(`/join/r/${reservationSid}`);
               break; 
            }
            case 'GROUP_RESERVATION_STATUS_EXPIRED': { 
                history.push(`/rejoin/r/${reservationSid}`);
                break;
            }
            case 'GROUP_RESERVATION_STATUS_CANCELED': { 
                history.push(`/`);
                break;
            }
        }
    }, [reservationStatus, reservationSid, history]);

    const handleCancel = async () => {
        try {
            await fetch(`${serverConfig.endpoint}/groups/AGENT/reservations/${reservationSid}/cancel`, {
                method: 'POST'
            });
            history.push(`/`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Grid container component="main">
            <div>
                <Typography component="h1" variant="h5">
                    You are in the queue
                </Typography>
                <Typography paragraph>
                    Your queue position is { queuePosition && queuePosition > -1 ? queuePosition : '-' }.
                </Typography>
                { estimatedWaitTime &&
                    <Typography paragraph>
                        Your estimated wait time is { estimatedWaitTime } min.
                    </Typography>
                }
                <Button
                    onClick={handleCancel}
                    variant="contained"
                    color="primary"
                >
                    Cancel Video Chat
                </Button>
            </div>
        </Grid>
    );
}
