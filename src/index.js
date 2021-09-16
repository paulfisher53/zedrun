import style from './style.scss';

const Web3 = require('../node_modules/web3/dist/web3.min.js');

import { NavBar } from './components/navbar';
import { Races } from './components/races';

import settings from './settings.json';
import racing_abi from './contracts/RacingArena.json';
import weth_abi from './contracts/WETH.json';
import { Horses } from './components/horses';

const ETH_PRICE_URL = 'https://us-central1-zed-production.cloudfunctions.net/eth-price-retrieval-production-price';
const API_URL = 'https://staging.zoomapps.com.au/partner/q/?e=ZED';

async function fetchJSON(url) {
    let result = await fetch(url);
    return await result.json();
}

async function startApp() {

    //Setup providers.
    const web3 = new Web3(window.ethereum);
    const matic = new Web3(new Web3.providers.HttpProvider(settings.rpcProvider));

    //Setup contracts.
    const racing = new matic.eth.Contract(racing_abi.M, settings.CONTRACT_ADDRESSES.RACING_ARENA);

    const weth = new matic.eth.Contract(weth_abi.M, settings.CONTRACT_ADDRESSES.MATIC_WETH);

    //Get the account details.
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const price = await fetchJSON(ETH_PRICE_URL);

    let nav = new NavBar();
    nav.account = account;
    nav.price = price.data.AUD;

    let horses = new Horses();

    fetchJSON(`${API_URL}&m=GetUserHorses&p={account:%22${account}%22}&get=true`).then((data) => horses.data = data);

    weth.methods.balanceOf(account).call().then((balance) => nav.balance = Web3.utils.fromWei(balance));

    let races = new Races();
    races.price = price.data.AUD;
    races.contract = racing;
    races.account = account;

    horses.onchange = () => {
        getRaceData(horses, races);
    }

    getRaceData(horses, races);

    setInterval(async () => {
        races.selected = horses.selected;
        await getRaceData(horses, races);
    }, 3000);


    let s = document.createElement('style');
    s.appendChild(document.createTextNode(style));
    document.head.appendChild(s);

    document.body.appendChild(nav);
    document.body.appendChild(horses);
    document.body.appendChild(races);

}

async function getRaceData(horses, races) {

    let data = await fetchJSON(`${API_URL}&m=GetRaces&p={offset:0,cl:%22${horses.filter.class}%22}&get=true`);
    let data2 = data.length === 10 ? await fetchJSON(`${API_URL}&m=GetRaces&p={offset:10,cl:%22${horses.filter.class}%22}&get=true`) : [];
    let data3 = horses.filter.class === '' && data2.length === 10 ? await fetchJSON(`${API_URL}&m=GetRaces&p={offset:20,cl:%22${horses.filter.class}%22}&get=true`) : [];
    let data4 = horses.filter.class === '' && data3.length === 10 ? await fetchJSON(`${API_URL}&m=GetRaces&p={offset:30,cl:%22${horses.filter.class}%22}&get=true`) : [];
    let rawdata = data.concat(data2).concat(data3).concat(data4);
    if (horses.filter.length > 0)
        rawdata = rawdata.filter((d) => {
            return d.length === horses.filter.length;
        });
    races.data = rawdata;
}

window.addEventListener('load', async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.enable();
            await startApp();
        } catch (error) {
            console.error(error);
        }
    }
});