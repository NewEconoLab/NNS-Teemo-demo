import React from 'react';
import ReactDOM from 'react-dom';
import { Provider, observer } from "mobx-react";
import Store from './store';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Router, Route,BrowserRouter } from 'react-router-dom'

const store = new Store();

ReactDOM.render(
        <Provider store={store}>
                <BrowserRouter basename="/nns">
                        <App />
                </BrowserRouter>
        </Provider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
