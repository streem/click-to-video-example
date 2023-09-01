import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Start from './Start';
import Hold from './Hold';
import Join from './Join';
import ReJoin from './ReJoin';
import CallRedirect from './CallRedirect';

const app = (
    <BrowserRouter>
        <Switch>
            {/* This homepage features a 'Video Chat' button, which serves as the initial entry point for this experience. */}
            <Route path="/" exact component={Home} />

            {/* After a user clicks the video chat button they should be taken to an intake form.
            Here you gather information about the customer and the issue. This information will be passed over 
            to experts so they have context when entering the call. */}
            <Route path="/start" exact component={Start} />

            {/* From the moment the customer taps ‘start video chat’ they enter the ‘queue’ screen.
            In this example you let the customer know they are now in the queue and can give them an estimated wait time. */}
            <Route path="/hold/r/:reservationSid" exact component={Hold} />

            {/* Once the queue is up customer are taken to this screen.
            This screen let’s them know the expert’s name that’s ready to connect and
            how long they have to join the call. */}
            <Route path="/join/r/:reservationSid" exact component={Join} />
            <Route path="/rejoin/r/:reservationSid" exact component={ReJoin} />
            <Route path="/call-redirect" exact component={CallRedirect} />
        </Switch>
    </BrowserRouter>
)

ReactDOM.render(app, document.getElementById('root') as HTMLElement);