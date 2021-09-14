import { html, LitElement, css, unsafeCSS } from 'lit';
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'
import style from './horses.scss';

export class Horses extends LitElement {

    static get properties() {
        return {
            data: { type: Array },
            selected: {state: true}
        }
    }

    constructor() {
        super();
        this.data = [];
        this.selected = null;
        this.filter = {
            class: "",
            length: 0
        }
    }

    toggle(e){
        e.currentTarget.classList.toggle('is-active');
    }

    click(e){
        let h = null;
        this.data.forEach((horse)=>{
            if(horse.horse_id === +e.currentTarget.dataset.id)
                h = horse;
        });
        this.selected = h;
    }

    setClassFilter(e){        
        this.filter.class = e.currentTarget.value;
    }

    setLengthFilter(e){        
        this.filter.length = +e.currentTarget.value;
    }

    displayHorse(horse){
        return html`<div class="horse-display"><img src="${horse.img_url}" height="25">&nbsp;&nbsp;<strong>${horse.hash_info.name}${horse.is_on_racing_contract ? ' (Racing)':''}</strong>&nbsp;• Class ${horse.class}&nbsp;• ${horse.genotype} ${horse.bloodline}</div>`;
    }

    render() {

        const angledown = icon(faAngleDown,{
            transform: {
                size: 8,
                y: -3
            }
        });

        return html`
        <style>
            ${css`${unsafeCSS(style)}`}            
        </style>
        <div class="dropdown" @click=${this.toggle}>
            <div class="dropdown-trigger">
                <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span id="selected-horse">${this.selected ? this.displayHorse(this.selected) : 'Select Horse'}</span>
                <span class="icon is-small">
                    ${angledown.node}
                </span>
                </button>
            </div>
            <div class="dropdown-menu" role="menu">
                <div class="dropdown-content">
                ${this.data.map((horse)=>{
                    return html`            
                    <div class="dropdown-item" data-id="${horse.horse_id}" @click=${this.click}>
                        ${this.displayHorse(horse)}
                    </div>            
                    `;
                })}       
                </div>
        </div>
        </div>
        <div class="select">
            <select @change=${this.setClassFilter}>
                <option value="">Class Filter</option>
                <option value="0">Griffin</option>
                <option value="1">Class 1</option>
                <option value="2">Class 2</option>
                <option value="3">Class 3</option>
                <option value="4">Class 4</option>
                <option value="5">Class 5</option>
            </select>   
        </div>
        <div class="select">
            <select @change=${this.setLengthFilter}>
                <option value="0">Length Filter</option>
                <option value="1000">1000m</option>
                <option value="1200">1200m</option>
                <option value="1400">1400m</option>
                <option value="1600">1600m</option>
                <option value="1800">1800m</option>
                <option value="2000">2000m</option>
                <option value="2200">2200m</option>
            </select>   
        </div>
        `;
    }
}

customElements.define('zed-horses', Horses);