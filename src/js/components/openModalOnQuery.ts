import { App } from './_app';

/**
 * открыть модальное окно при соответствующем параметре
 */
export function openModalOnQuery(app: App) {
  const params = new URLSearchParams(window.location.search);
  if (!params.size && !params.has("openmodal")) return;

  switch (params.get("openmodal")) {
    case "auth": {
      app.func.openLogin();
      break;
    }
    default: {
      break;
    }
  }
}
