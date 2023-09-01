import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { serverConfig } from './env';
import { GroupName } from './groups';


export default function ReJoin() {
    const { reservationSid } = useParams<{reservationSid: string}>();
    const history = useHistory();

    const handleReJoin = async () => {
        try {
            const response = await fetch(`${serverConfig.endpoint}/groups/${GroupName.DEFAULT}/reservations/rejoin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservationSid: reservationSid }),
            });
            const reservation = await response.json();
    
            history.push(`/hold/r/${reservation['reservation_sid']}`);
        } catch (err) {
            console.error(err);
        }
    }

    const handleCancel = async () => { history.push(`/`) };

    return (
        <Grid container component="main">
            <div>
                <Typography component="h1" variant="h5">
                    You lost your position in the queue
                </Typography>
                <Typography paragraph>
                    Would you like to rejoin?
                </Typography>
                <Button
                    onClick={handleReJoin}
                    variant="contained"
                    color="primary"
                >
                    Rejoin Queue
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
