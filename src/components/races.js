const Web3 = require('../../node_modules/web3/dist/web3.min.js');

import { html, LitElement, css, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import style from './races.scss';
import { ICON_HORSE, ICON_FREE } from '../images';

import settings from '../settings.json';

function processRace(race, selected) {
    let count = 0;
    let available = race.fee === "0.0" ? 6 : 1;
    for (let gate in race.gates) {
        count += 1;
        if (+gate === available)
            available += 1;
        if (selected && race.gates[gate].horse_id === selected.horse_id)
            race.selected = true;
    }
    race.registered = count;
    race.availableGate = available;
}

function rsv(e) {
    const t=e.substring(2),a="0x"+t.substring(0,64),n="0x"+t.substring(64,128),s=parseInt(t.substring(128,130),16);return{r:a,s:n,v:s<2?27+s:s};
}

export class Races extends LitElement {

    static get properties() {
        return {
            data: { type: Array }
        }
    }

    constructor(contract) {
        super();
        this.data = [];
        this.price = 0;
        this.selected = null;
        this.account = null;
        this.contract = contract;
    }

    async race(ev) {
        const race = ev.currentTarget.dataset.id,
            gate = +ev.currentTarget.dataset.gate;

        this.registerHorse(race, gate);

    }

    async registerHorse(race, gate) {

        const e = this.account,
            horseid = this.selected.horse_id;

        let i = this.contract.methods.registerHorse(Web3.utils.toHex(race), horseid, gate).encodeABI();
        let nonce = await this.contract.methods.getNonce(e).call();
        let t = {
            "types": {
                "EIP712Domain": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "version",
                        "type": "string"
                    },
                    {
                        "name": "verifyingContract",
                        "type": "address"
                    },
                    {
                        "name": "salt",
                        "type": "bytes32"
                    }
                ],
                "MetaTransaction": [
                    {
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "name": "from",
                        "type": "address"
                    },
                    {
                        "name": "functionSignature",
                        "type": "bytes"
                    }
                ]
            },
            "domain": {
                "name": "ZED Racing",
                "version": "1",
                "verifyingContract": settings.CONTRACT_ADDRESSES.RACING_ARENA,
                "salt": "0x0000000000000000000000000000000000000000000000000000000000000089"
            },
            "primaryType": "MetaTransaction",
            "message": {
                "nonce": nonce,
                "from": e,
                "functionSignature": i
            }
        };

        const a = [e, JSON.stringify(t)];
        window.ethereum.request({
            method: "eth_signTypedData_v4",
            params: a,
            jsonrpc: "2.0",
            id: 999999999999,
            from: e
        }).then((p => {
            const { r: y, s: N, v: g } = rsv(p)
                , A = {
                    to: settings.CONTRACT_ADDRESSES.RACING_ARENA,
                    userAddress: e,
                    apiId: '9e40565f-b896-4882-9cca-7ed1a39caeda',
                    params: [e, i, y, N, g]
                };
            fetch('https://api.biconomy.io/api/v2/meta-tx/native', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": "qPw8VUbt_.f8043b2b-8451-496e-b29b-f414507ac120"
                },
                body: JSON.stringify(A)
            }).then(async(p) => {
                if (p.status === 200) {
                    alert('Done');
                } else {
                    console.log(p);
                    let msg = 'Unknown Error';
                    let json = await p.json();
                    if(json && json.log && json.log.indexOf('Racing: race not accepting registrations') !== -1)
                        msg = 'Race is full';
                    alert('Error - ' + msg);
                }
            }).catch((err => {
                console.log("an error has occured. Logged with Biconomy"),
                    console.log(err);
            }
            ));
        })).catch((err => {
            console.log("an error has occured. Logged with Metamask"),
                console.log(err);
        }
        ));
    }

    render() {

        return html`
        <style>
            ${css`${unsafeCSS(style)}`}            
        </style>
        <table class="table is-size-7-mobile">
            <thead>
                <tr>
                <th class="is-hidden-mobile">Event</th>
                <th>Class</th>
                <th>Distance</th>
                <th>Fee</th>
                <th>Gates</th>
                <th>Race</th>
                </tr>
            </thead>
            <tbody>
                ${this.data.map((race) => {
            processRace(race, this.selected);
            let invalid = (!this.selected || this.selected.class < race.class || (race.class === 0 && this.selected.class !== 0));
            let highlight = this.selected && this.selected.class === race.class;
            return html`
                    <tr>
                        <td class="is-hidden-mobile">${race.name}${race.selected ? html` <img class="registered-icon d-none d-md-inline-block" src="${ICON_HORSE}"> ` : ''}</td>
                        <td><div class="racing-tag racing-tag--${race.class}">Class ${race.class}</div></td>
                        <td>${race.length}m</td>
                        <td style="color:#27b18a;">${race.fee === "0.0" ? html`
                        <img src="${ICON_FREE}" alt="">
                        ` : html`<strong>$${(race.fee * this.price).toFixed(2)}</strong>`}</td>
                        <td><strong>${race.registered}/12</strong></td>
                        <td>
                            ${race.availableGate > 12 || invalid || race.selected ?
                    html`
                                    <button class="button is-small is-fullwidth" disabled>
                                        <strong>${race.selected ? 'In Race' : (invalid ? 'Can\'t Race' : 'Race Full')}</strong>
                                    </button>
                                    `
                    :
                    html`
                                    <button data-id="${race.race_id}" data-gate="${race.availableGate}" class=${classMap({
                        'button': true,
                        'is-info': !highlight,
                        'is-primary': highlight,
                        'is-small': true,
                        'is-fullwidth': true
                    })} @click=${this.race}>
                                        <strong>Gate ${race.availableGate}</strong>
                                    </button>
                                    `
                }                            
                        </td>
                    </tr>
                    `;
        })}
            </tbody>
        </table>
        `;
    }
}

customElements.define('zed-races', Races);