import trustedQS from '../shared/trustedQS';
import { cityInputCDEKModal } from './address-input/cityInputCDEK';
import { fetchScript } from './ymaps';

export async function fetchScriptWidget() {
    return new Promise((resolve, reject) => {
        const script = DcCrEl('script');
        script.src =
            'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3';
        script.onload = resolve;
        script.onerror = reject;
        Dc.head.appendChild(script);
    });
}

export function initCdekInOrder(host) {
    let map: any;

    fetchScript();

    const submitBtn = trustedQS(document, '[name="submit-order"]') as HTMLButtonElement;
    submitBtn.disabled = false;

    const element = Qs('.order-step__section_address');
    if(Qs('.order-step__section')) {
        if (element) {
            element.style.display = "none";
        }

        Qs('.order-step__opt-crt-mail')?.addEventListener('click', (e) => {
            if (element) {
                element.style.display = "block";
                //Qs('.order-step__section_address').style.display = "none";
            }
        })
        Qs('.order-step__opt-crt-cdek')?.addEventListener('click', (e) => {
            if (element) {
                element.style.display = "none";
            }
        })
        Qs('.order-step__opt-crt-emsDelivery')?.addEventListener('click', (e) => {
            if (element) {
                element.style.display = "block";
                //Qs('.order-step__section_address').style.display = "block";
            }
        })
    }


    const mapWrapperElem = trustedQS(
        document,
        '.cdek-map'
    );
    const cdekCityInput = trustedQS<HTMLInputElement>(
        host.el,
        '[name="city-input-cdek"]'
    ) as HTMLInputElement;

    if (!window['addressInputModals'].cdekCity) {
        window['addressInputModals'].cdekCity = new cityInputCDEKModal();
    }

    const cityModal = window['addressInputModals'].cdekCity;

    if (mapWrapperElem) {
        mapWrapperElem.addEventListener('click', (e) => {
            mapWrapperElem.classList.remove('is-opened');
        });

        mapWrapperElem.querySelector('.cdek-map-inner')!.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        mapWrapperElem.querySelector('.cdek-modal__close')!.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            mapWrapperElem.classList.remove('is-opened');
        });

        const backBtn = trustedQS(mapWrapperElem, '.cdek-pvz-info-inner-back');
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const sideInfo = trustedQS(document, '.cdek-pvz-info');
            sideInfo.classList.add('hidden');
        });

        const chooseBtn = trustedQS(mapWrapperElem, '.cdek-pvz-info-inner-button');
        chooseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (chooseBtn.dataset.pvz) {
                chooseBtn.classList.remove('_active');
                chooseBtn.textContent = 'Выбран';

                const data = JSON.parse(chooseBtn.dataset.pvz);
                onChoosePvz(data);
                cityModal.currentPvz = data;

                mapWrapperElem.classList.remove('is-opened');
            }
        })
    }

    const openBtnListener = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!cdekCityInput.value) {
            cdekCityInput.classList.add('has-error');
            app?.modules.snackBar.showError(
                'Необходимо выбрать город',
                {time: 4000}
            );
        } else {
            if (mapWrapperElem) {
                mapWrapperElem.classList.add('is-opened');
                const mapElem = document.querySelector('.cdek-map-inner-map')!;

                if (!map) {
                    initCdekMap(mapElem, cityModal)
                        .then((ymap) => {
                            map = ymap;
                        });
                } else {
                    if (!cityModal.currentPvz) {
                        const sideInfo = trustedQS(document, '.cdek-pvz-info');
                        const chooseBtn = trustedQS(sideInfo, '.cdek-pvz-info-inner-button');
                        chooseBtn.classList.add('_active');
                        chooseBtn.textContent = 'Выбрать';
                        sideInfo.classList.add('hidden');

                        map.removeChild(cityModal.mapLayer);
                        map.removeChild(cityModal.mapDataSource);

                        cityModal.mapDataSource = undefined;
                        cityModal.mapLayer = undefined;

                        mapAddPoints(cityModal, map);

                        map.setMargin([0,0,0,0]);
                        map.update({
                            location: {
                                center: [cityModal.cityCoords.longitude, cityModal.cityCoords.latitude],
                                zoom: 12,
                            }
                        });
                    }
                }
            }
        }
    };

    cdekCityInput.addEventListener('focus', (e) => {
        e.stopImmediatePropagation();
        cdekCityInput.blur();
        cityModal.open();
    });
    cdekCityInput.parentNode.querySelector('.ui-input__change')
        .addEventListener('click', () => {
            cityModal.open();
        });

    cityModal.cityInput.opt.afterSubmit = (ci) => {
        console.log(ci);
        console.log(cityModal.cityCoords);

        cdekCityInput.parentNode!['classList'].add('is-focused');
        cdekCityInput.classList.remove('has-error');
        cdekCityInput.value = cityModal.value;

        clearPvz(cityModal);

        cityModal.close({enScroll: true});
        // cityModal.close({ enScroll: false });
    };

    Qs('.cdek-open-btn')!.addEventListener('click', openBtnListener);
}

async function initCdekMap(mapElem, cityModal) {
    await ymaps3.ready;

    const {
        YMap,
        YMapDefaultSchemeLayer,
        YMapDefaultFeaturesLayer,
        YMapFeatureDataSource,
        YMapLayer
    } = ymaps3;

    const map = new YMap(
        mapElem,
        {
            location: {
                center: [cityModal.cityCoords.longitude, cityModal.cityCoords.latitude],
                zoom: 12,
            },
        },
        [
            new YMapDefaultSchemeLayer({}),
            new YMapDefaultFeaturesLayer({})
        ]
    );

    mapAddPoints(cityModal, map);

    return map;
}

export function onChoosePvz(data: any) {
    const cdek = Qs('.order-step__opt-crt-cdek');
    const cdekOpenBtn = Qs('.order-step__opt-crt-cdek .cdek-open-btn');

    if (cdek) {
        const cdekRadio = cdek.querySelector('input');
        cdekRadio.click();
        document.querySelector('.order-step__section_address')!.style.display = 'none';
        //document.querySelector('.order-step__section_address-2')!.style.display = 'none';
    }

    if (cdekOpenBtn) {
        cdekOpenBtn.classList.remove('_active');
        cdekOpenBtn.textContent = 'Изменить пункт выдачи';
    }
    // Выбран пункт выдачи заказов:
    // Адрес пункта:
    const pvz = document.querySelector('.cdek-pvz');
    const pvzValue = `Выбран пункт выдачи заказов: ${data.code}, ${data.location.city}`;
    if (pvz) {
        pvz.querySelector('span').textContent = pvzValue;
        pvz.querySelector('input').value = data.uuid;
    }

    const addressElem = document.querySelector('.cdek-address');
    const addressValue = `Адрес пункта: ${data.location.address}`;
    if (addressElem) {
        addressElem.querySelector('span').textContent = addressValue;
        addressElem.querySelector('input').value = data.name;
    }
}

export function clearPvz(cityModal: any) {
    cityModal.currentPvz = undefined;
    const cdek = Qs('.order-step__opt-crt-cdek');
    const cdekOpenBtn = Qs('.order-step__opt-crt-cdek .cdek-open-btn');

    if (cdekOpenBtn) {
        cdekOpenBtn.classList.add('_active');
        cdekOpenBtn.textContent = 'Выбрать пункт выдачи';
    }

    const pvz = document.querySelector('.cdek-pvz');
    const pvzValue = '';
    if (pvz) {
        pvz.querySelector('span').textContent = pvzValue;
        pvz.querySelector('input').value = '';
    }

    const addressElem = document.querySelector('.cdek-address');
    const addressValue = '';
    if (addressElem) {
        addressElem.querySelector('span').textContent = addressValue;
        addressElem.querySelector('input').value = '';
    }
}

export function getBounds(coordinates: number[][]): any {
    let minLat = Infinity,
        minLng = Infinity;
    let maxLat = -Infinity,
        maxLng = -Infinity;

    for (const coords of coordinates) {
        const lat = coords[1];
        const lng = coords[0];

        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
    }

    return [
        [minLng, minLat],
        [maxLng, maxLat]
    ] as any;
}

export async function mapAddPoints(cityModal: any, map: any) {
    const {
        YMapFeatureDataSource,
        YMapLayer
    } = ymaps3;

    const feautureDataSource = new YMapFeatureDataSource({id: 'pvz-source'});
    const layer = new YMapLayer({source: 'pvz-source', type: 'markers'});

    cityModal.mapDataSource = feautureDataSource;
    cityModal.mapLayer = layer;

    map
        .addChild(feautureDataSource)
        .addChild(layer);

    const {YMapClusterer, clusterByGrid} = await ymaps3.import('@yandex/ymaps3-clusterer@0.0.1');
    const COMMON_LOCATION_PARAMS: Partial<any> = {easing: 'ease-in-out', duration: 2000};

    const contentPin = document.createElement('div');
    contentPin.classList.add('marker');
    contentPin.innerHTML = '<svg data-v-287a28bc="" xmlns="http://www.w3.org/2000/svg" width="28" height="36" fill="none" class="cdek-6pvvrh"><path fill="#1AB248" d="M28 14.344c0 2.788-.777 5.391-2.12 7.594C20.2 31.245 14 36 14 36S7.8 31.245 2.12 21.938A14.54 14.54 0 0 1 0 14.343C0 6.422 6.268 0 14 0s14 6.422 14 14.344"></path><rect width="22" height="22" x="3" y="3" fill="#fff" rx="11"></rect><path fill="#1AB248" fill-rule="evenodd" d="M20.794 17.624h-.814c.184.304.292.656.292 1.033 0 1.138-.969 2.065-2.16 2.065-1.19 0-2.16-.927-2.16-2.065 0-.377.108-.729.293-1.033h-2.564c.185.304.292.656.292 1.033 0 1.138-.968 2.065-2.159 2.065s-2.16-.927-2.16-2.065c0-.377.108-.729.293-1.033h-.823a.53.53 0 0 1-.54-.516l-.01-7.124-1.75-1.674a.5.5 0 0 1 0-.73c.21-.201.554-.201.764 0l1.927 1.843c.008.007.01.016.016.024a.5.5 0 0 1 .059.083.49.49 0 0 1 .064.349l.01 6.712h11.13a.53.53 0 0 1 .54.517.53.53 0 0 1-.54.516m-8.98 0c-.595 0-1.08.463-1.08 1.033s.485 1.032 1.08 1.032 1.08-.463 1.08-1.032c0-.57-.485-1.033-1.08-1.033m5.218 1.033c0 .569.485 1.032 1.08 1.032s1.08-.463 1.08-1.032c0-.57-.484-1.033-1.08-1.033-.595 0-1.08.463-1.08 1.033m2.682-3.098h-8.476a.53.53 0 0 1-.54-.517V7.793c0-.285.242-.516.54-.516h4.805l3.671.02c.298 0 .54.231.54.516v7.23a.53.53 0 0 1-.54.516m-.54-7.23-3.131-.02v1.55a.53.53 0 0 1-.54.516.53.53 0 0 1-.54-.516v-1.55h-3.185v6.217h7.396z" clip-rule="evenodd"></path><rect width="22" height="22" x="3" y="3" fill="#fff" rx="11"></rect><rect width="22" height="22" x="3" y="3" fill="#fff" rx="11"></rect><path stroke="#1AB248" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M8 19h12M9.333 19V9.667L14.667 7v12m4 0v-6.667l-4-2.666M12 11v.007M12 13v.007M12 15v.007M12 17v.007"></path></svg>'

    const marker = (feature) => new ymaps3.YMapMarker(
        {
            coordinates: feature.geometry.coordinates,
            source: 'pvz-source',
            onClick() {
                const data = feature.properties.data;
                // .cdek-pvz-info-inner-badge
                const sideInfo = trustedQS(document, '.cdek-pvz-info');
                const badge = trustedQS(sideInfo, '.cdek-pvz-info-inner-badge');
                const description = trustedQS(sideInfo, '.cdek-pvz-info-inner-description');
                const workTime = trustedQS(sideInfo, '.cdek-pvz-info-inner-works-val');
                const chooseBtn = trustedQS(sideInfo, '.cdek-pvz-info-inner-button');

                chooseBtn.dataset.pvz = JSON.stringify(data);

                badge.textContent = data.code;
                description.textContent = data.location.address_full;
                workTime.textContent = data.work_time;

                if (cityModal.currentPvz) {
                    if (data.uuid !== cityModal.currentPvz.uuid) {
                        chooseBtn.classList.add('_active');
                        chooseBtn.textContent = 'Выбрать';
                    } else {
                        chooseBtn.classList.remove('_active');
                        chooseBtn.textContent = 'Выбран';
                    }
                }

                sideInfo.classList.remove('hidden');

                if (window.innerWidth > 1024) {
                    map.setMargin([0,290,0,0]);
                }
                map.update({
                    location: {
                        center: feature.geometry.coordinates,
                        zoom: 16,
                        // margin: [0,0,550,0],
                        ...COMMON_LOCATION_PARAMS
                    }
                });
            },
        },
        contentPin.cloneNode(true)
    );

    const cluster = (coordinates, features) => new ymaps3.YMapMarker(
        {
            coordinates,
            source: 'pvz-source',
            onClick() {
                const bounds = getBounds(features.map((feature) => feature.geometry.coordinates));
                map.update({location: {bounds, ...COMMON_LOCATION_PARAMS}});
            }
        },
        circle(features.length).cloneNode(true)
    );

    function circle(count) {
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.innerHTML = `
        <div class="circle-content">
            <span class="circle-text">${count}</span>
        </div>;
    `;
        return circle;
    }

    const points = cityModal.pvzListArray.map((item, i) => ({
        // lnglat
        type: 'Feature',
        id: i,
        geometry: {
            coordinates: [
                item.location.longitude,
                item.location.latitude
            ]
        },
        properties: {
            data: item
        }
    }));

    const clusterer = new YMapClusterer({
        method: clusterByGrid({gridSize: 64}),
        features: points,
        marker,
        cluster
    });

    map.addChild(clusterer);
}




