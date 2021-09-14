import style from './style.scss';

const Web3 = require('../node_modules/web3/dist/web3.min.js');

import { NavBar } from './components/navbar';
import { Races } from './components/races';

import settings from './settings.json';
import racing_abi from './contracts/RacingArena.json';
import weth_abi from './contracts/WETH.json';
import { Horses } from './components/horses';

const ETH_PRICE_URL = 'https://us-central1-zed-production.cloudfunctions.net/eth-price-retrieval-production-price';

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

    setInterval(async () => {
        
        let balance = await weth.methods.balanceOf(account).call();
        nav.balance = Web3.utils.fromWei(balance);

        horses.data = await fetchJSON(`https://api.zed.run/api/v1/horses/get_user_horses?public_address=${account}&offset=0&gen[]=1&gen[]=268&horse_name=&sort_by=created_by_desc`);

    },5000);

    let races = new Races();
    races.price = price.data.AUD;
    races.contract = racing;
    races.account = account;
    setInterval(async () => {
        races.selected = horses.selected;
        let filters = [];
        if (horses.filter.class !== '')
            filters.push(`class=${horses.filter.class}`);
        const urlfilters = filters.length > 0 ? '&' + filters.join('&') : '';
        let data = await fetchJSON(`https://racing-api.zed.run/api/v1/races?offset=0&status=open${urlfilters}`);
        let data2 = await fetchJSON(`https://racing-api.zed.run/api/v1/races?offset=10&status=open${urlfilters}`);
        let data3 = urlfilters === '' ? await fetchJSON(`https://racing-api.zed.run/api/v1/races?offset=20&status=open${urlfilters}`) : [];
        let data4 = urlfilters === '' ? await fetchJSON(`https://racing-api.zed.run/api/v1/races?offset=30&status=open${urlfilters}`) : [];
        let rawdata = data.concat(data2).concat(data3).concat(data4);
        if (horses.filter.length > 0)
            rawdata = rawdata.filter((d) => {
                return d.length === horses.filter.length;
            });
        races.data = rawdata;
    }, 2000);


    let s = document.createElement('style');
    s.appendChild(document.createTextNode(style));
    document.head.appendChild(s);

    document.body.appendChild(nav);
    document.body.appendChild(horses);
    document.body.appendChild(races);

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