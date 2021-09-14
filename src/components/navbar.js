import { html, LitElement, css, unsafeCSS } from 'lit';
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faWallet } from '@fortawesome/free-solid-svg-icons'
import style from './navbar.scss';

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
                    <img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjU2IiB2aWV3Qm94PSIwIDAgODYgNTYiIHdpZHRoPSI4NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Im0wIDBoODZ2NTZoLTg2eiIvPjxnIGZpbGw9IiNmZmYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE2IDkpIj48cGF0aCBkPSJtMTEuOTgyNDcxMiAxM2gtMTEuOTgyNDcxMmMwIDIuODg1OTMyNyAyLjg1OTQ2MjgzIDIuOTI3NDc0MSAyLjg1OTQ2MjgzIDIuOTI3NDc0MWg4LjE2OTkwNDY3bC0xMS4wMjkzNjc1IDE4LjMxNDE0MTZjMCAyLjc0OTc5NjYgMi43OTEzNzU4OCAyLjc1NzMzMjQgMi43OTEzNzU4OCAyLjc1NzMzMjRoMTEuODEyMjkxNzJjMC0yLjczMDYzNTMtMi42MjExOTY0LTIuNzU3MzMyNC0yLjYyMTE5NjQtMi43NTczMzI0aC05LjEyMzAwODM3bDExLjc0NDIwNDc3LTE4LjMxNDE0MTZjMC0yLjkyNzQ3NDEtMi42MjExOTY0LTIuOTI3NDc0MS0yLjYyMTE5NjQtMi45Mjc0NzQxIi8+PHBhdGggZD0ibTM0LjI5OTk5MDEgMzQuMjQxNjE5NXMuMDI3ODE3NSAyLjc1NzMzMjQtMi44MTQ1Mjg5IDIuNzU3MzMyNGwtOS4xNjY4MzI2LS4wMDA1NjEyYy0uMjgwMjU1MS0uMDA4OTc5Ny0yLjY2MjQyNDEtLjE2MTYzNDgtMi42NjI0MjQxLTIuNzU2NzcxMnptLjAyNzgwMjMtMTAuNjU0ODg5MnYyLjc1NzQ4MzloLTE0LjY3MTYwMzF2LTIuNzU3NDgzOXptLTIuODQyMzM4OC0xMC41ODY3MzAzYzIuNjgxNTU4MiAwIDIuODQyMzg0MyAyLjkyNzQ3NDEgMi44NDIzODQzIDIuOTI3NDc0MWgtMTQuNjcxNjQxYzAtMi42Mjg1ODA3IDIuNjg5MjQ1NS0yLjkyNzQ3NDEgMi42ODkyNDU1LTIuOTI3NDc0MXoiLz48cGF0aCBkPSJtNTAuOTQ4Mzg5OSAxNS45MjU1NDd2MTYuNDI1ODA3OHMtLjAyNTY3NDYgMS44Njk3MDI3LTEuNjY3Nzg5NiAxLjg2OTcwMjdsLTUuOTUxNzAxMy4wMTg2MzExcy0xLjY3MzczNDkgMC0xLjY3MzczNDktMS45MDM1OTQ2bC4wMTA0MTM3LTE1LjIwODM0NjVzMC0xLjIwMjIwMDUgMS42MzI0NTg3LTEuMjAyMjAwNXptMi43NTczMzI0IDE4LjMxNDE0MTZ2LTM0LjIzOTY4ODZoLTIuNzU3MzMyNHYxMi45OTgwNzI5aC05LjE5MTI4NDdjLTIuNzI5NDk5MyAwLTIuNzU3MTA1MiAyLjkyNzQ3NDEtMi43NTcxMDUyIDIuOTI3NDc0MXYxOC4zMTQxNDE2YzAgMi43NTEzNDkzIDIuNjU1MTY0MSAyLjc1NzMzMjQgMi42NTUxNjQxIDIuNzU3MzMyNGg5LjMyNzM0NWMyLjg1MzAyNTMgMCAyLjcyMzIxMzItMi43NTczMzI0IDIuNzIzMjEzMi0yLjc1NzMzMjR6IiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L2c+PHBhdGggZD0ibTIwLjM0NCAxNy40YzEuMDk2IDAgMS45My0uMTk4IDIuNTAyLS41OTRzLjg1OC0uOTYyLjg1OC0xLjY5OGMwLS41Mi0uMTM2LS45NTgtLjQwOC0xLjMxNHMtLjY0OC0uNjEtMS4xMjgtLjc2MmMuMzUyLS4xODQuNjI2LS40MzYuODIyLS43NTZzLjI5NC0uNjg0LjI5NC0xLjA5MmMwLS42NzItLjI3NC0xLjIwNC0uODIyLTEuNTk2cy0xLjMzNC0uNTg4LTIuMzU4LS41ODhoLTQuMTA0djguNHptLS40OC00Ljk1NmgtMS45MzJ2LTEuOThoMS45MzJjLjQ4IDAgLjg0NC4wODIgMS4wOTIuMjQ2cy4zNzIuNDEuMzcyLjczOC0uMTI0LjU3Ni0uMzcyLjc0NC0uNjEyLjI1Mi0xLjA5Mi4yNTJ6bS4zMzYgMy40OTJoLTIuMjY4di0yLjA3NmgyLjI2OGMxLjAzMiAwIDEuNTQ4LjM0OCAxLjU0OCAxLjA0NCAwIC4zNTItLjEzLjYxMi0uMzkuNzhzLS42NDYuMjUyLTEuMTU4LjI1MnptMTEuNDg0IDEuNDY0di0xLjU2aC00LjU3MnYtMS45NDRoMy45di0xLjUxMmgtMy45di0xLjgyNGg0LjQxNnYtMS41NmgtNi4zNDh2OC40em01LjIzMiAwdi02LjgxNmgyLjY4OHYtMS41ODRoLTcuMzJ2MS41ODRoMi42ODh2Ni44MTZ6bTQuNjIgMCAuNzQ0LTEuOGgzLjlsLjc0NCAxLjhoMi4wNGwtMy43NTYtOC40aC0xLjkybC0zLjc0NCA4LjR6bTQuMDMyLTMuMjc2aC0yLjY2NGwxLjMzMi0zLjIxNnoiIGZpbGw9IiNmMGY4ZmYiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iLjY0Ii8+PC9nPjwvc3ZnPg==">
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