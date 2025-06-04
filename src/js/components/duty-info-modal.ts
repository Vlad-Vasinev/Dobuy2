import { Modal } from './header/modal';
//- Информация о пошлине
export function initDutyInfoModal(){
  const triggers = QsA("[open-duty-info]")
  if(!triggers.length) return
  
  const modal = new Modal({
    container: ".duty-info-modal",
    fromTemplate: true,
    selMainTpl: ".tpl--duty-info-modal",
    openTriggers: triggers,
  });
  // modal.open()
  return modal
}   