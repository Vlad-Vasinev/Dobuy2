import Swiper from "swiper";

type StoriesContent =
  | {
      type: "folders";
      folders: StoriesFolderContent[];
    }
  | {
      type: "singles";
      singleItems: StoriesSingleContent[];
    };
interface StoriesSingleContent {
  title: string;
  preview: string;
  item: StoriesItemContent;
}
interface StoriesFolderContent {
  icon: string;
  title: string;
  preview: string;
  items: StoriesItemContent[];
}
interface StoriesItemContent {
  type: "image" | "video";
  src: string;
  preview: string;
  desk: string;
  duration?: string;
}
interface StoriesConfig {
  mainSel: string;
  innerSel: string;
  previewItem: string;
}
export declare function initStories(config?: {
  mainSel: string;
  innerSel: string;
  previewItem: string;
}): Stories;
declare class Stories {
  contentUrl: string;
  config: StoriesConfig;
  el: HTMLElement;
  content?: StoriesContent;
  fs?: StoriesFullscreen | null;
  videosOnPage?: NodeListOf<HTMLVideoElement>;
  constructor(el: HTMLElement, contentUrl: string, config: StoriesConfig);
  private getConfig;
  unmuted: boolean;
  open(index?: number): void;
  close(): Promise<void>;
}
declare class StoriesFullscreen {
  private stories;
  private content;
  el: HTMLElement;
  slides: HTMLElement[];
  slider: Swiper;
  storiesItemsStorage: FragmentStorage<HTMLElement>;
  storiesItems: StoriesFolder[] | StoriesSingle[];
  private folderTpl;
  constructor(stories: Stories, content: StoriesContent);
  private prevStoriesItem?;
  private currentStoriesItem?;
  private onSlideTransitionEnd;
  private onSlideChange;
  private toggleVisible;
  open(index?: number): Promise<unknown>;
  close(): Promise<unknown>;
  destroy(): void;
}
declare class FragmentStorage<T extends HTMLElement> {
  fragment: DocumentFragment;
  array: Array<T | undefined>;
  add(el: T, i: number): T;
  get(i: number): T;
  clear(): void;
}
declare class videoStorage extends FragmentStorage<HTMLVideoElement> {
  unmuteAll(): void;
}
declare class StoriesFolder {
  private storiesFs;
  el: HTMLElement;
  swiper?: Swiper;
  descEl: any;
  videoStorage: videoStorage;
  constructor(
    storiesFs: StoriesFullscreen,
    el: HTMLElement,
    content: StoriesFolderContent,
    params?: {
      unmuted?: boolean;
    }
  );
  fillContent(content: StoriesFolderContent, unmuted?: boolean): void;
  unmute(): void;
  private slideNextTimer?;
  private currentLoad?;
  initSwiper(): void;
  destroy(): void;
}
declare class StoriesSingle {
  private storiesFs;
  el: HTMLElement;
  descEl: any;
  video?: HTMLVideoElement;
  private currentLoad?;
  slide?: HTMLElement;
  constructor(
    storiesFs: StoriesFullscreen,
    el: HTMLElement,
    content: StoriesSingleContent,
    params?: {
      unmuted?: boolean;
    }
  );
  fillContent(content: StoriesSingleContent, unmuted?: boolean): void;
  start(): void;
  unmute(): void;
  destroy(): void;
}
export {};
