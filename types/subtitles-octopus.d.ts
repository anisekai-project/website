declare module 'subtitles-octopus' {
  interface SubtitlesOctopusOptions {
    video: HTMLVideoElement;
    subUrl: string;
    fonts?: string[];
    workerUrl: string;
    legacyWorkerUrl?: string;
    fallbackFont?: string;
    blendContext?: string;
    renderMode?: 'js-blend' | 'wasm-blend';
    targetFps?: number;
    onReady?: () => void;
    onError?: (error: Error) => void;
  }

  export default class SubtitlesOctopus {
    constructor(options: SubtitlesOctopusOptions);

    dispose(): void;
    freeTrack?(): void;
    // Add any other methods you use
  }
}
