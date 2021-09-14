const Web3 = require('../../node_modules/web3/dist/web3.min.js');

import { html, LitElement, css, unsafeCSS } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import style from './races.scss';

import settings from '../settings.json';

function processRace(race,selected){
    let count = 0;
    let available = 1;
    for(let gate in race.gates){
        count += 1;
        if(+gate === available)
            available += 1;
        if(selected && race.gates[gate].horse_id === selected.horse_id)
            race.selected = true;
    }
    race.registered = count;
    race.availableGate = available;
}

function rsv(e) {
    const t = e.substring(2);
    return {
        r: "0x" + t.substring(0, 64),
        s: "0x" + t.substring(64, 128),
        v: parseInt(t.substring(128, 130), 16)
    }
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
    
    async registerHorse(ev) {

        const e = this.account,
            horseid = this.selected.horse_id,
            race = ev.currentTarget.dataset.id,
            gate = +ev.currentTarget.dataset.gate;

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
            }).then((p => {
                if(p.status === 200){
                    alert('Done');
                }else{
                    console.log(p);
                    alert('Error');
                }
            })).catch((err => {
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
                    processRace(race,this.selected);
                    let invalid = (!this.selected || this.selected.class < race.class || (race.class === 0 && this.selected.class !== 0));
                    let highlight = this.selected && this.selected.class === race.class;
                    return html`
                    <tr>
                        <td class="is-hidden-mobile">${race.name}${race.selected?html` <img class="registered-icon d-none d-md-inline-block" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjAgMjAiIHdpZHRoPSIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTIgMmMyLjY1MjE2NDkgMCA1LjE5NTcwNCAxLjA1MzU2ODQgNy4wNzEwNjc4IDIuOTI4OTMyMTkgMS44NzUzNjM4IDEuODc1MzYzNzggMi45Mjg5MzIyIDQuNDE4OTAyOTEgMi45Mjg5MzIyIDcuMDcxMDY3ODFzLTEuMDUzNTY4NCA1LjE5NTcwNC0yLjkyODkzMjIgNy4wNzEwNjc4LTQuNDE4OTAyOSAyLjkyODkzMjItNy4wNzEwNjc4IDIuOTI4OTMyMi01LjE5NTcwNDAzLTEuMDUzNTY4NC03LjA3MTA2NzgxLTIuOTI4OTMyMmMtMS44NzUzNjM3OS0xLjg3NTM2MzgtMi45Mjg5MzIxOS00LjQxODkwMjktMi45Mjg5MzIxOS03LjA3MTA2NzggMC01LjUyMjg0NzUgNC40NzcxNTI1LTEwIDEwLTEwem0wIDJjLTQuNDE4Mjc4IDAtOCAzLjU4MTcyMi04IDhzMy41ODE3MjIgOCA4IDggOC0zLjU4MTcyMiA4LThjMC0yLjEyMTczMTkyLS44NDI4NTQ3LTQuMTU2NTYzMjItMi4zNDMxNDU4LTUuNjU2ODU0MjUtMS41MDAyOTEtMS41MDAyOTEwMy0zLjUzNTEyMjMtMi4zNDMxNDU3NS01LjY1Njg1NDItMi4zNDMxNDU3NXptLTQuNzI5ODU4NjYgNC4wNzAyNTE0Ni40NDc3MzQ3OC40MDk5Nzc5My4xNTg1NDg3LjA1OTcxOTU4LjE3NDM0MjA2LjA4NTU5MDEzLjQwODQ4MDU1LjIwMDcwODUzLjY5MTk4MzU4LjI2NzE0NTkzLjIxNzc3NzgzLjA4ODkxNjMyLjIyODY1NjY0LjA5Mzk3NzQxLjI1ODY3NDEyLjExNzk5Mjc2LjA1NTkwNTA0LjA1MDQxMjM4LjI3MTk3MDQ2LjE1NTUwNDM0LjA3MDUxMDkuMDQxNjc5NTMuMjgyMDQzNC4xODQ3NzkyNC40MTE3ODM0LjA5NTI2NzQ5LjEyMzk5ODQuMDE4NTU3MzEuMTU1NjI3NS4wMjkwNzY0My4zNDI0ODEzLjEyODUxMTkzLjMzMjQwODQuMTQyNTA0Mi4xMDg1ODY3LjAzOTY5NDguMzEyMjYyNC4wODM1NTc2LjA2MTg0ODEuMDA3MDQ1OC4yMDI3NjkxLS4wMDg5MzEzLjUyNjIxMjQtLjAyMzcxNzcuMTAzODUyNC0uMDE0MjkwMSAxLjI5NzUwMDYtLjMwMTU4MTIuMDgwNTgzOC0uMDE1NTgwMi40MTk1Mzk2LS4wMjY1OTU0Ny4wNjcxODY4LjAwMzY3MTc3LjAyNDEzMS4wOTg2NDE1LjA3ODA2NTYuMDI0MDE1NC41NjUwOTQyLjI0NzU5NjIuMzY1NjQ5MS4xMzgwMzg3LjE4MjgyNDYuMjUxMjY4LjE3MjE0NzMuMzE5NjQyMy4wNTU4MDQzLjMxNzI2MDYuMDY1MzczNi41MTk2MDQ3LjA0MTYwMTQuNjMxMTQ3Mi4wMzUyNTU0LjE3MjI3NTQuMDcxNjE4OS4zMTQ0ODE5di4wNjY2ODczbC0uMDA3NzU2Mi42MDY5MzMzLjAwNzc1NjIuMDUwNDEyNHYuMjk1MzI5MmwtLjAxMTE4MS4wMzU0Mjc2LS4wMDQyMzA2LjA1MjE5ODYtLjAyNjM5MTIuMTkzMzEzNy0uMDM1NTU3Ny4xNDE4MDk2LS4wMzkxODM5LjEzMTA5Mi0uMTA1ODY3LjQ3NDQ1Mi4wMjA3NTA0LjI1NjIyOTguMDM0MTQ3NC40MTI3MjY2LjA0NjEzNDIuNDA2ODcxNi4wMzY4NjcxLjExMjMzNjIuMDE4NjM1LjA0OTYxODUtLjA4NjEyMzkuMDQzNTY1MS0uMDU4ODI2Mi4wNTg4NDc1LS4xMDAxMjU1LjIxNjUzNTEtLjAwNTEzNzIuMDc3NjAzMy4wNTczMTUzLjIwNjUxMjEuMDA1NTQwMS4wMjg2Nzk1LS4wMjk1MTM4LjAwODAzODItMS43NTQ0MjEtLjAzMjg0NzUuMDg0MTA5NC0uMTY3NTEyLjA0MjUwOC0uMDQ0NjU2Ni4wNzA1MTA5LS4wNzY4MDk0LjE2NjkwOTItLjI2MjE4NDEuMDkwOTU5LS4zNTg2NDI0LjAzODI3NzQtLjg4NDAyOTR2LS42NDAzNDk3bC0uMDg4MDM3OS0uMjU2NjI2OC0uMTY0MTk1LS4zMTY1MDAxLS4xMTgyNTY4LS43Mzk3OTgyLS43MjczOTk2LjExMTc2MDgtLjYwODAxNjQuMTQwOTk1OC0uMjUyODMxOC4wNzMyMzY5LTEuNjYzNDUxOS4xMjIzNTkyaC0uMjk3NjU2NmwtLjA0OTA1NTQuMDA3MjQ0My4xOTk1NDU4IDEuMDgzMTkxNC0uMDAxMzA5NS4wOTkyMzctLjA0MzExMjQuMjQ4Njg3OC4wMDQ4MzUuMDcwMjU5OC4xMTkzNjQ5IDEuMTI5OTEyMi0uMDQ1MzI4NC4wMzIxNTI4LS4wMzAyMTkuMDQwOTg0OC0uMDc1MDQzNy4yNDExNDU5LjAwODE1OTEuMDU4MjUyMS4wOTA2NTY4LjE0MDYxODcuMDEwODc4OS4wNzU0MjAxLS4xODkzNzIxLjA0Mjg3MDQtLjE5MDM3OTMuMDA2OTQ2Ni0xLjAxOTc0MzkuMDIzNjE4NC0uMTYyNDc3MTkuMDA5OTIzNy4wMDc0NTQtLjAyMjcyNTMuMDkyMzY5MTktLjE1NjM5NzQuMDQwMjkyLS4wNDAzODk1LjA4OTA0NTEtLjA5ODU0MjMuMDc3ODY0MS0uMTI2MTMwMi4wMjAxNDYtLjAzNDQzNTItLjAzMDIxODktLjAzOTY5NDguMDY1Nzc2NS0uMjcwOTE2OS4wMTAwNzMtLjA1NTY3Mi0uMDAxMjA4OC0uNDY2NDEzNy0uMDEwMDcyOS0uMDg5MzEzMy0uMDYxMjQzOC0uNDA0ODg2OS0uMDIyODY1Ni0uMjI3NDUxMS0uMDM1NTU3Ni0uMzc0NTIwMy0uMDIyMjYxMy0uMjM3MDc3MS0uMDA3MzUzMy0uMDQxODc4LS4yODA0MzE3Ny0uOTYwNjEzOS0uMDQ2NTM3MTYtLjA1NTk2OTctLjM0MzEzMDIzLS4yMDUwMjM2LS4wNTYxMDY0OS0uMDU2MzY2Ni0uMTUzNTQ0MTctLjE3NTc0ODYtLjAxODIzMjA5LS4wNzI0NDMuMDAwNzA1MTEtLjE4MTAwODMtLjAxMTM4MjQ3LS4xMzIzODIxLS4wOTM0NzcyNS0uNTA2MTA4NS0uMjIxNTk4NzItLjI4OTgwNDctLjIwNTQ1MTg5LS4zMDE3NDY5LS4yNzAxNTczMi0uMTU3Mzg5OS0uMDU3NDE1OTktLjA1MDQxMjMtLjE4Nzc2MDM0LS4xMjYwMzEtLjI3MDQ2MDI3LS4wOTMxMDQ0LS41MzA0MjQwMS4xMTIyNTcxLS41MTg4NTkxOS4yNTM4NDkyLS4wNTk4MzM1LjA2OTQ2NTloLS4zMzU4MzMxNWwtLjE2MDg2NTQ5LS4xOTM4NDM1LS4wMjk0MTMxLS4wMTUzODE4LS4wODE4OTMzMi0uMTM4NjM0LS4wMDY0NDY3MS0uMDMyMjUyLS4wMDg0NjEzMS0uMTUxOTMxOHYtLjI4MDUxMDJsLjA0NTkzMjc5LS4xNzAzODk5LjAxMzM5NzA3LS4wMzU0Mjc2LjIwMzU3NDkyLS4zODkzMDY2NC4wNTc1MTY3MS0uMDc1NDIwMS4wODc2MzQ5My0uMDg4NTE5MzcuMjIyNzEzNTgtLjI4Nzc4NzIyLjAxNjcyMTE1LS4wNDgxMjk5My0uMDAwOTA2NTctLjEyODUxMTg4LjA3OTI3NDM1LS4xOTA5MzE5My4zMzAzMjM5NC0uNTM5OTQ4MzYtLjA1NjE4Mjg3LS40MTUyMjM2M3oiIGZpbGw9IiNmZmE3MDAiIGZpbGwtcnVsZT0iZXZlbm9kZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTIgLTIpIi8+PC9zdmc+"> `:''}</td>
                        <td><div class="racing-tag racing-tag--${race.class}">Class ${race.class}</div></td>
                        <td>${race.length}m</td>
                        <td style="color:#27b18a;">${race.fee === "0.0" ? html`
                        <img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgNTMgMjQiIHdpZHRoPSI1MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im00IDBoMzguODU5MjY1YzEuMzM3NDEyNyAwIDIuNTg2MzM4LjY2ODQwNDU0IDMuMzI4MjAxMSAxLjc4MTE5OTIybDUuMzMzMzMzNCA4Yy44OTU3MzE3IDEuMzQzNTk3NjguODk1NzMxNyAzLjA5NDAwMzg4IDAgNC40Mzc2MDE1OGwtNS4zMzMzMzM0IDhjLS43NDE4NjMxIDEuMTEyNzk0Ny0xLjk5MDc4ODQgMS43ODExOTkyLTMuMzI4MjAxMSAxLjc4MTE5OTJoLTM4Ljg1OTI2NWMtMi4yMDkxMzkgMC00LTEuNzkwODYxLTQtNHYtMTZjMC0yLjIwOTEzOSAxLjc5MDg2MS00IDQtNHoiIGZpbGw9IiNmZWU5MTIiLz48cGF0aCBkPSJtMTAuNjg4IDE3IC43MTQtMy41N2g0LjUyMmwuMzc4LTEuODJoLTQuNTVsLjUxOC0yLjU5aDUuMTI0bC4zNzgtMS44MmgtNy40MDZsLTEuOTYgOS44em04LjcwOCAwIC43MjgtMy42NGMuMTQtLjY5MDY2NjcuNDA4MzMzMy0xLjE5OTMzMzMuODA1LTEuNTI2cy45MjYzMzMzLS40OSAxLjU4OS0uNDljLjA3NDY2NjcgMCAuMjQyNjY2Ny4wMDkzMzMzLjUwNC4wMjhsLjM5Mi0yLjAxNmMtLjYyNTMzMzMgMC0xLjE2OS4wNzkzMzMzMy0xLjYzMS4yMzhzLS44NTYzMzMzLjQxNTMzMzMtMS4xODMuNzdsLjE4Mi0uODk2aC0yLjA3MmwtMS40OTggNy41MzJ6bTcuODU0LjExMmMuNTk3MzMzMyAwIDEuMTY2NjY2Ny0uMDg0IDEuNzA4LS4yNTJzMS4wMjItLjQyIDEuNDQyLS43NTZsLS45MS0xLjQ0MmMtLjI2MTMzMzMuMjI0LS41NjcuMzk2NjY2Ny0uOTE3LjUxOHMtLjcxNjMzMzMuMTgyLTEuMDk5LjE4MmMtMS4yMjI2NjY3IDAtMS44NzEzMzMzLS41MTMzMzMzLTEuOTQ2LTEuNTRoNS43NjhjLjA4NC0uNDIuMTI2LS44MDI2NjY3LjEyNi0xLjE0OCAwLS42NjI2NjY3LS4xNDctMS4yNDYtLjQ0MS0xLjc1cy0uNzA5MzMzMy0uODkxMzMzMy0xLjI0Ni0xLjE2MmMtLjUzNjY2NjctLjI3MDY2NjY3LTEuMTY5LS40MDYtMS44OTctLjQwNi0uODU4NjY2NyAwLTEuNjI0LjE4OS0yLjI5Ni41NjdzLTEuMTk3LjkwMDY2NjctMS41NzUgMS41NjgtLjU2NyAxLjQxNjMzMzMtLjU2NyAyLjI0N2MwIC42NzIuMTU2MzMzMyAxLjI2NDY2NjcuNDY5IDEuNzc4cy43NjA2NjY3LjkwNzY2NjcgMS4zNDQgMS4xODMgMS4yNjIzMzMzLjQxMyAyLjAzNy40MTN6bTIuMTctNC41NjRoLTMuNzM4Yy4xNDkzMzMzLS40ODUzMzMzLjQwMTMzMzMtLjg2NTY2NjcuNzU2LTEuMTQxcy43ODg2NjY3LS40MTMgMS4zMDItLjQxMy45MjE2NjY3LjEzNzY2NjcgMS4yMjUuNDEzLjQ1NS42NTU2NjY3LjQ1NSAxLjE0MXptNi42MjIgNC41NjRjLjU5NzMzMzMgMCAxLjE2NjY2NjctLjA4NCAxLjcwOC0uMjUyczEuMDIyLS40MiAxLjQ0Mi0uNzU2bC0uOTEtMS40NDJjLS4yNjEzMzMzLjIyNC0uNTY3LjM5NjY2NjctLjkxNy41MThzLS43MTYzMzMzLjE4Mi0xLjA5OS4xODJjLTEuMjIyNjY2NyAwLTEuODcxMzMzMy0uNTEzMzMzMy0xLjk0Ni0xLjU0aDUuNzY4Yy4wODQtLjQyLjEyNi0uODAyNjY2Ny4xMjYtMS4xNDggMC0uNjYyNjY2Ny0uMTQ3LTEuMjQ2LS40NDEtMS43NXMtLjcwOTMzMzMtLjg5MTMzMzMtMS4yNDYtMS4xNjJjLS41MzY2NjY3LS4yNzA2NjY2Ny0xLjE2OS0uNDA2LTEuODk3LS40MDYtLjg1ODY2NjcgMC0xLjYyNC4xODktMi4yOTYuNTY3cy0xLjE5Ny45MDA2NjY3LTEuNTc1IDEuNTY4LS41NjcgMS40MTYzMzMzLS41NjcgMi4yNDdjMCAuNjcyLjE1NjMzMzMgMS4yNjQ2NjY3LjQ2OSAxLjc3OHMuNzYwNjY2Ny45MDc2NjY3IDEuMzQ0IDEuMTgzIDEuMjYyMzMzMy40MTMgMi4wMzcuNDEzem0yLjE3LTQuNTY0aC0zLjczOGMuMTQ5MzMzMy0uNDg1MzMzMy40MDEzMzMzLS44NjU2NjY3Ljc1Ni0xLjE0MXMuNzg4NjY2Ny0uNDEzIDEuMzAyLS40MTMuOTIxNjY2Ny4xMzc2NjY3IDEuMjI1LjQxMy40NTUuNjU1NjY2Ny40NTUgMS4xNDF6IiBmaWxsPSIjMTgxOTFjIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L2c+PC9zdmc+" alt="">
                        ` : html`<strong>$${(race.fee * this.price).toFixed(2)}</strong>`}</td>
                        <td><strong>${race.registered}/12</strong></td>
                        <td>
                            ${
                                race.availableGate > 12 || invalid || race.selected ?
                                    html`
                                    <button class="button is-small is-fullwidth" disabled>
                                        <strong>${race.selected ? 'In Race' : (invalid ? 'Can\'t Race' : 'Race Full')}</strong>
                                    </button>
                                    `
                                    :
                                    html`
                                    <button data-id="${race.race_id}" data-gate="${race.availableGate}" class=${classMap({
                                        'button':true, 
                                        'is-info':!highlight,
                                        'is-primary': highlight,
                                        'is-small':true,
                                        'is-fullwidth':true
                                    })} @click=${this.registerHorse}>
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