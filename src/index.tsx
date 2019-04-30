import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, observer } from "mobx-react";
import Store from './store';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Router, Route,BrowserRouter } from 'react-router-dom'

import DivDefault from './components/divDefault';
import DivNnsCenter from './components/divNnsCenter';
import DivNnsResolver from './components/divNnsResolver';
import DivAuction from './components/divAuction';
import DivNnsCredit from './components/divNnsCredit';
import DivNFTtest from './components/divNFTtest';
import DivNFTDEX from './components/divNFTDEX';

const store = new Store();

ReactDOM.render(
        <Provider store={store}>
                <BrowserRouter basename="/nns">
                        <App>
                                <Route path="/" exact  component={DivDefault}/>
                                <Route path="/nnscenter" component={DivNnsCenter}/>
                                <Route path="/nnsresolver" component={DivNnsResolver}/>
                                <Route path="/nnsauction" component={DivAuction}/>
                                <Route path="/nnscredit" component={DivNnsCredit}/>
                                <Route path="/nfttest" component={DivNFTtest}/>
                                <Route path='/nftdex' component={DivNFTDEX} />
                        </App>
                </BrowserRouter>
        </Provider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
