import { Modal } from './header/modal';

export function mtsFlexInfoModal(){
  const triggers = QsA("[data-mts-flex-open]")
  if(!triggers.length) return
  const modal = new Modal({
    container: ".mts-flex-info-modal",
    fromTemplate: true,
    selMainTpl: ".tpl--mts-flex-info-modal",
    openTriggers: triggers,
  });
  return modal
}