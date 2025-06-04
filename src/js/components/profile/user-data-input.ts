import { qsUnwrapTpl } from '../../shared/templates';
import trustedQS from '../../shared/trustedQS';
import { MyForm } from '../forms';

export class UserDataInput extends MyForm {
  statusEl: HTMLElement;
  constructor(el: HTMLFormElement) {
    super(el, {
      initFields: true,
      plainFields: true,
      method: "POST",
    });
    this.statusEl = trustedQS(this.el, ".prof-user-inputs__status")
    
    this.onSuccess = (res) => {
      res.ok && (this.complete = true) 
    };
    
  }
  private set complete(val: boolean){
    const cmplt = this.el.hasAttribute('completed')
    if(cmplt == val) return 
    this.statusEl.innerHTML = ''
    if(val){
      this.statusEl.appendChild(qsUnwrapTpl(".tpl--profile--status-complete"))
      this.el.setAttribute('completed', '')
    }
    else{
      this.statusEl.appendChild(qsUnwrapTpl(".tpl--profile--status-not-complete"))
      this.el.removeAttribute('completed')
    }
  }
}
