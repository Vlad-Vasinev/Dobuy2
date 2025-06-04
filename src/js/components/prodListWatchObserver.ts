import { YMProductFieldObject } from '../../types/ya_metrica_types';


/**
 * отсылать данные в метрику при просмотре списка
 */
export function prodListWatchObserver() {
  const getListName = (el: HTMLElement) => {
    return el.dataset.listName ?? "Неизвестный список";
  };
  const getProductFields = (el: HTMLElement) => {
    return {
      id: el.dataset.itemId ?? "",
      name: el.querySelector(".prod-card__title")?.textContent || "",
    };
  };
  const observer = new IntersectionObserver(
    async (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const listItems = Array.from(
          entry.target.querySelectorAll<HTMLElement>(".prod-card")
        ).map<YMProductFieldObject>((el, i) => {
          return {
            ...getProductFields(el),
            list: getListName(entry.target as HTMLElement),
            position: i + 1,
          };
        });
        dataLayer?.push({
          ecommerce: {
            currencyCode: "RUB",
            impressions: listItems,
          },
        });
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px",
      threshold: 0.5,
    }
  );
  QsA(".product-grid").forEach((list) => {
    observer.observe(list);
    // Отправить данные перед тем как будет переход на страницу карточки
    list.addEventListener("click", async (ev) => {
      const target = ev.target as HTMLElement;
      const closestA = target.closest("a");
      if (!closestA) return;
      const card = target.closest<HTMLElement>(".prod-card");
      if (card) {
        ev.preventDefault();
        const link = closestA.href;
        const cardData = getProductFields(card);
        await new Promise<void>((r) => {
          dataLayer?.push({
            ecommerce: {
              currencyCode: "RUB",
              click: {
                products: [
                  {
                    ...cardData,
                    list: getListName(list),
                  },
                ],
              },
            },
          });
          r();
        });
        window.location.href = link;
      }
    });
  });
}
