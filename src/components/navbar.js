import { html, LitElement, css, unsafeCSS } from 'lit';
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import style from './navbar.scss';
import { LOGO_ZED } from '../images';

export class NavBar extends LitElement {

    static get properties() {
        return {
            account: { type: String },
            balance: { type: Number }
        }
    }

    constructor() {
        super();
        this.account = null;
        this.price = 0;
        this.balance = 0;
    }

    render() {

        const wallet = icon(faWallet);

        return html`
        <style>
            ${css`${unsafeCSS(style)}`}            
        </style>
        <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
            <div class="navbar-brand">
                <a class="navbar-item">
                    <img src="${LOGO_ZED}">
                </a>
            </div>
            <div class="navbar-end">
            <div class="navbar-item">
                <div class="buttons">
                    <button class="button is-light is-size-7-mobile">
                        <strong>$${(this.balance * this.price).toFixed(2)} AUD&nbsp;&nbsp;</strong>
                        <span class="icon is-small">
                            ${wallet.node}
                        </span>
                    </button>
                    <button class="button is-primary is-size-7-mobile">
                        <strong>${(this.account || 'Start').substr(0,8).toUpperCase()}</strong>
                    </button>
                </div>
            </div>
            </div>
        </nav>
        `;
    }
}

customElements.define('zed-navbar', NavBar);