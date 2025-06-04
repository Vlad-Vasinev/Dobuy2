globalThis.clb = {};

import { isMobile, isTablet, isDesktop } from "./shared/check-viewport";
globalThis.clb.isMobile = isMobile;

import { aPixels } from "./shared/aPixels";
globalThis.clb.aPixels = aPixels;

import { disableScroll, enableScroll } from "./shared/scroll";
globalThis.clb.disableScroll = disableScroll;
globalThis.clb.enableScroll = enableScroll;


