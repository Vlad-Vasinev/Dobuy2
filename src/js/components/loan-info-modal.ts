import { Modal } from './header/modal';
// Не используется
export function initLoanInfoModal(){
  const triggers = QsA("[open-loan-info]")
  if(!triggers.length) return
  const modal = new Modal({
    container: ".loan-info-modal",
    fromTemplate: true,
    selMainTpl: ".tpl--loan-info-modal",
    openTriggers: triggers,
  });
  // modal.open()
  return modal
}