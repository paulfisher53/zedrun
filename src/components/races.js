const Web3 = require('../../node_modules/web3/dist/web3.min.js');

import { html, LitElement, css, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import style from './races.scss';
import { send } from '../matic';
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
export class Races extends LitElement {

    static get properties() {
        return {
            data: { type: Array },
            error: { type: String },
            message: { type: String }
        }
    }

    constructor(contract) {
        super();
        this.data = [];
        this.price = 0;
        this.selected = null;
        this.account = null;
        this.contract = contract;
        this.error = '';
        this.message = '';
    }

    async race(ev) {
        const race = ev.currentTarget.dataset.id,
            gate = +ev.currentTarget.dataset.gate;

        this.registerHorse(race, gate);

    }

    async registerHorse(race, gate) {

        const e = this.account,
            horseid = this.selected.horse_id;

        let func = this.contract.methods.registerHorse(Web3.utils.toHex(race), horseid, gate).encodeABI();
        let nonce = await this.contract.methods.getNonce(e).call();

        let response = await send(
            this.account,
            settings.CONTRACT_ADDRESSES.RACING_ARENA,
            nonce,
            func);

        if (response.status === 200) {
            this.message = 'Horse entered successfully!';
            setTimeout(()=>this.message = '',5000); 
        } else {
            console.log(response);
            let msg = 'Unknown Error';
            let json = await response.json();
            if (json && json.log)
                try {
                    msg = new RegExp(/message\\":\\"execution reverted: (.+)\\"}}/).exec(json.log)[1];
                } catch (e) {
                }

            this.error = msg;    
            setTimeout(()=>this.error = '',5000);        
        }
    }    

    render() {

        return html`
        <style>
            ${css`${unsafeCSS(style)}`}            
        </style>
        ${this.error ? html`
        <article class="message is-danger">
            <div class="message-body">
                ${this.error}
            </div>
        </article>
        ` : ''}
        ${this.message ? html`
        <article class="message is-success">
            <div class="message-body">
                ${this.message}
            </div>
        </article>
        ` : ''}
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