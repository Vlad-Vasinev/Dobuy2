import headBannerInit from "./head-banner";
//import { productGridSlider } from './slider-product-grid';
import { infoBannerGridSlider } from "./info-banner";
import { prodPageGallery } from "./prod-page-gallery";
import { reviewsBlockInit } from "./reviews";
import { productSliderAll } from "./slider-product-grid";
import { superSliderAll } from "./slider-product-grid";
import { productSliderMob } from "./slider-product-grid";
import { unpackingReviewSliderAll } from "./unpacking-reviews";
import { selectionSliderAll } from "./unpacking-reviews";
import { itemsReviewSliderAll } from "./items-reviews";
import { isMobile } from "../../shared/check-viewport";
import { blogSliderAll } from "./slider-product-grid";
//import { blogSliderAll } from "./slider-product-grid";
// import { sideReviewSliderAll } from "./reviews-slider-side";

//prodic

export default function initSliders() {
  let start: any;
  
  
  headBannerInit();
  
  superSliderAll();
  productSliderAll();
  
  productSliderMob();
  
  if(isMobile()) {
    blogSliderAll();
  }
  //productGridSlider()
  
  reviewsBlockInit();

  unpackingReviewSliderAll();

  selectionSliderAll();

  itemsReviewSliderAll();

  // sideReviewSliderAll();
}
