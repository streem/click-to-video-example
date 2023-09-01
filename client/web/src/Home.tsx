import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';


export default function Home() {
    const history = useHistory();

    return (
        <Grid container component="main">
            <div>
                <Typography component="h1" variant="h5">
                    Video Chat Now
                </Typography>
                <Typography paragraph>
                    Reach an expert from 8am - 5pm.
                    Enter your information and wait for an expert to assist you. 
                </Typography>
                <Button
                    onClick={() => { history.push('/start') }}
                    variant="contained"
                    color="primary"
                >
                    Video Chat
                </Button>
            </div>
        </Grid>
    );
}