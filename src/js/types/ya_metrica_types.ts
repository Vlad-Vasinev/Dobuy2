export interface EcommerceWrap {
  ecommerce: YMEcommerceObject;
}

type YMActionType =
  /**
   * клик по товару в списке;
   */
  | "click"
  /**
   * просмотр товара;
   */
  | "detail"
  /**
   * добавление товара в корзину;
   */
  | "add"
  /**
   * удаление товара из корзины;
   */
  | "remove"
  /**
   * покупка;
   */
  | "purchase";
// -- не нужны в проекте
// /**
//  * просмотр внутренней рекламы;
//  */
// | "promoView"
// /**
//  * клик по внутренней рекламе.
//  */
// | "promoClick";

/**
 * Интерфейс для объекта ecommerce.
 */
export type YMEcommerceObject = {
  [key in YMActionType]?: {
    /**
     * Дополнительные данные, описывающие произведенное действие.
     * Обрабатывается только если ActionType == purchase
     */
    actionField?: YMActionField;
    /**
     * Список товаров.
     */
    products: YMProductFieldObject[];

    /**
     * Список описаний рекламной кампании, с которой было произведено указанное действие.
     */
    promotions?: YMPromoFieldObject[];
  };
} & {
  /**
   * Трехбуквенный код валюты по стандарту ISO 4217.
   */
  currencyCode: string;
  /**
   * просмотр списка товаров;
   */
  impressions?: YMProductFieldObject[];
};

/**
 * Объект, описывающий действие в ecommerce.
 */
interface YMActionField {
  /**
   * Идентификатор транзакции.
   */
  id?: string;

  /**
   * Полный доход или выручка от транзакции.
   */
  revenue?: number;

  /**
   * Код купона, примененный к транзакции.
   */
  coupon?: string;
}

/**
 * Объект, описывающий отдельный товар.
 */
export interface YMProductFieldObject {
  /**
   * Идентификатор товара.
   */
  id: string;

  /**
   * Название товара.
   */
  name?: string;

  /**
   * Бренд товара.
   */
  brand?: string;

  /**
   * Категория товара.
   */
  category?: string;

  /**
   * Код купона на товар.
   */
  coupon?: string;

  /**
   * Размер скидки на товар (указывается как число).
   */
  discount?: number;
  /**
   * Список, к которому относится товар.
   * Чтобы оценивать эффективность списка на разных этапах взаимодействия пользователя
   * с товаром, рекомендуем указывать список товара во всех событиях,
   * которые были после просмотра списка.
   */
  list?: string;
  /**
   * Позиция товара в списке.
   */
  position?: number;
  /**
   * Цена товара.
   */
  price?: number;
  /**
   * Количество товара.
   */
  quantity?: number;
  /**
   * Вариант товара.
   */
  variant?: string;
}

/**
 * Объект, описывающий рекламную кампанию.
 */
interface YMPromoFieldObject {
  /**
   * Идентификатор промоакции.
   */
  id: string;

  /**
   * Название промоакции.
   */
  name: string;

  /**
   * Творческий материал промоакции.
   */
  creative?: string;

  /**
   * Позиция промоакции.
   */
  position?: string;
}
