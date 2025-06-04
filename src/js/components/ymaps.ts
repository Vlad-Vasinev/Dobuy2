/**
 * добавляют на страницу скрипт яндекс карт (ymaps)
 */
export async function fetchScript() {
  return new Promise((resolve, reject) => {
    const script = DcCrEl("script");
    script.src =
    "https://api-maps.yandex.ru/v3/?apikey=80d825c5-161d-4e34-93fd-4458214443eb&lang=ru_RU";
    script.onload = resolve;
    script.onerror = reject;
    Dc.head.appendChild(script);
  });
}

/**
 * ищет блок карты и если он есть - инициализирует карту
 */
export function setMap(blockSelector = '.js-ymap') {
  if (Qs(blockSelector)) {
    if (typeof ymaps3 === "undefined") {
      fetchScript().then((res) => {
        if (res === "error") return;
        initMap(blockSelector);
      });
    }
  }
}

/**
 * инициализация яндекс карт 
 */
export async function initMap(blockSelector) {
  await ymaps3.ready;

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapControls,
    YMapMarker,
  } = ymaps3;

  const mapEl = Qs(blockSelector);

  if (mapEl instanceof HTMLElement) {
    let longitudeStr: string = "";
    let latitudeStr: string = "";

    let longitude: number;
    let latitude: number;

    if (!mapEl.dataset.longitude || !mapEl.dataset.latitude) {
      throw new Error("");
    } else {
      longitudeStr = mapEl.dataset.longitude;
      latitudeStr = mapEl.dataset.latitude;

      longitude = parseFloat(longitudeStr);
      latitude = parseFloat(latitudeStr);
    }

    const map = new YMap(
      mapEl,
      {
        location: {
          center: [longitude, latitude],
          zoom: 13,
        },
      },
      [new YMapDefaultFeaturesLayer({})]
    );

    const { YMapDefaultMarker } = await ymaps3.import(
      "@yandex/ymaps3-markers@0.0.1"
    );
    const { YMapZoomControl } = await ymaps3.import(
      "@yandex/ymaps3-controls@0.0.1"
    );
    const { YMapGeolocationControl } = await ymaps3.import(
      "@yandex/ymaps3-controls@0.0.1"
    );

    let marker = new YMapDefaultMarker({
      coordinates: [longitude, latitude],
    });

    map.setBehaviors(["drag", "dblClick"]);
    mapEl.addEventListener(
      "click",
      () => {
        map.setBehaviors(["drag", "scrollZoom", "dblClick"]);
      },
      { once: true }
    );
    map.addChild(
      new YMapControls({ position: "right" }).addChild(new YMapZoomControl({}))
    );
    map.addChild(
      new YMapControls({ position: "left" }).addChild(
        new YMapGeolocationControl({})
      )
    );

    map.addChild(marker);
    map.addChild(new YMapDefaultSchemeLayer({}));
  }
}
