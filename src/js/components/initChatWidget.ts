/**
 * виджет с чатами
 */
export function initChatWidget() {
  const chatLink = Qs(".chat-w");
  if (!chatLink) return;
  //
  const openChatMenu = (e: Event) => {
    e.stopPropagation();
    chatLink.classList.add("_open");
  };
  const closeChatMenu = (e: Event) => {
    e.stopPropagation();
    chatLink.classList.remove("_open");
  };
  //
  chatLink.addEventListener("click", openChatMenu);
  chatLink
    .querySelector(".chat-w__close")
    ?.addEventListener("click", closeChatMenu);
}
