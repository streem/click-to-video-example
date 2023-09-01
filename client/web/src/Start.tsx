import React, { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { serverConfig } from './env';
import { GroupName } from './groups';


export default function Start() {
    const [name, setName] = useState('Joe L.');
    const [email, setEmail] = useState('joel@example.com');
    const [item, setItemName] = useState('Plumbing Trouble');
    const [description, setDescription] = useState('I have a leaky faucet');
    const history = useHistory();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`${serverConfig.endpoint}/groups/${GroupName.DEFAULT}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    externalUserId: email,
                    details: [
                        { label: 'name', value: name},
                        { label: 'item', value: item },
                        { label: 'description', value: description }
                    ]
                }),
            });
            const reservation = await response.json();
    
            history.push(`/hold/r/${reservation['reservation_sid']}`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Grid container component="main">
            <div>
                <Typography component="h1" variant="h5">
                    Connect with an expert
                </Typography>
                <Typography paragraph>
                    Tell us a bit about you and what we might help you with
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="name"
                        label="Name"
                        name="name"
                        helperText="The display name of the user"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="name"
                        label="Email"
                        name="email"
                        helperText="The email address of the user"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="item"
                        label="Item"
                        name="item"
                        helperText="Item that needs servicing"
                        value={item}
                        onChange={e => setItemName(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="description"
                        label="Description"
                        name="description"
                        helperText="Describe the issue you are experiencing"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Start Video Call
                    </Button>
                </form>
            </div>
        </Grid>
    );
}