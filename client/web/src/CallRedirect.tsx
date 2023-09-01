import React, { useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';


// Custom hook that builds on useLocation to parse the query string.
function useQuery() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export default function CallRedirect() {
    const history = useHistory();
    const query = useQuery();

    return (
        <Grid container component="main">
            <div>
                { query.get('statusCode') === 'OK' ?
                    <>
                        <Typography component="h1" variant="h5">
                            Thank you for contacting us!
                            RoomId for your the call: {query.get('roomId')}.
                        </Typography>
                        <Button
                            onClick={() => { history.push(`/`) }}
                            variant="contained"
                            color="primary"
                        >
                            Home
                        </Button>
                    </>
                    :
                    <>
                        <Typography component="h1" variant="h5">
                            Apologies!
                        </Typography>
                        <Typography paragraph>
                            An error occured during the Streem video call. StatusCode: {query.get('statusCode')}.
                        </Typography>
                        <Button
                            onClick={() => { history.push(`/rejoin/r/${query.get('reservationSid')}`) }}
                            variant="contained"
                            color="primary"
                        >
                            Rejoin Queue
                        </Button>
                        <Button
                            onClick={() => { history.push('/') }}
                            variant="contained"
                            color="inherit"
                        >
                            Cancel Video Chat
                        </Button>
                    </>
                }
            </div>
        </Grid>
    );
}