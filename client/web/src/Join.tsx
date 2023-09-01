import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { serverConfig } from './env';
import { GroupName } from './groups';

export default function Join() {
    let { reservationSid } = useParams<{reservationSid: string}>();
    const [reservationTimeout, setReservationTimeout] = useState<number>();
    const [reservationStatus, setReservationStatus] = useState<string>();
    const [name, setName] = useState('');
    const [expertName, setExpertName] = useState('');
    const [joinUrl, setJoinUrl] = useState('');
    const history = useHistory();

    useEffect(() => {
        const getJoinUrl = async () => {
            try {
                const response = await fetch(`${serverConfig.endpoint}/groups/${GroupName.DEFAULT}/reservations/${reservationSid}/join-url`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const joinUrl = await response.json();
                setJoinUrl(joinUrl['join_url']);
            } catch(e) {
                console.error(e);
            }
        }

        getJoinUrl().catch((e) => console.error(e));
    }, [reservationSid]);

    useEffect(() => {
        const eventSource = new EventSource(`${serverConfig.endpoint}/events/g/${GroupName.DEFAULT}/r/${reservationSid}`);
        eventSource.onmessage = (event) => {
            const reservation = JSON.parse(event.data);
            console.log("Join page: ", reservation);

            setReservationTimeout(Math.round((Date.parse(reservation['reserved_until']) - Date.now()) / (60 * 1000)));
            setReservationStatus(reservation['reservation_status']);
            if (reservation["reserved_user"]) {
                setExpertName(reservation["reserved_user"]["name"]);
            }

            const details: { label: string; value: string }[] = reservation['details'];
            const nameDetail = details.find((detail) => detail['label'] === 'name');
            if (nameDetail) {
                setName(nameDetail['value']);
            }
        };
    }, [reservationSid, history]);

    useEffect(() => {
        switch(reservationStatus) { 
            case 'GROUP_RESERVATION_STATUS_EXPIRED': { 
                history.push(`/rejoin/r/${reservationSid}`);
                break;
            }
            case 'GROUP_RESERVATION_STATUS_CANCELED': { 
                history.push(`/`);
                break;
            }
        }
    }, [reservationSid, reservationStatus, history]);

    const handleJoin = () => {
        window.location.href = joinUrl;
    };

    const handleCancel = async () => {
        try {
            await fetch(`${serverConfig.endpoint}/groups/${GroupName.DEFAULT}/reservations/${reservationSid}/cancel`, {
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
                    { name ? name : 'Hi' }
                </Typography>
                <Typography component="h3" variant="h5">
                    Ready to connect { expertName ? `with ${expertName}` : '!' }!
                </Typography>
                <Typography paragraph>
                    You have { reservationTimeout && reservationTimeout < 1 ? 'less than 1' : reservationTimeout } minute(s) to connect
                </Typography>
                <Button
                    onClick={handleJoin}
                    variant="contained"
                    color="primary"
                    disabled={!joinUrl}
                >
                    Join Lobby
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="contained"
                    color="inherit"
                >
                    Cancel Video Chat
                </Button>
            </div>
        </Grid>
    );
}