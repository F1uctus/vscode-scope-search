declare module 'picomatch' {
  interface PicomatchOptions {
    dot?: boolean;
  }
  function picomatch(pattern: string | string[], options?: PicomatchOptions): (input: string) => boolean;
  export = picomatch;
}
