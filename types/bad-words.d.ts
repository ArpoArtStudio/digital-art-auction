declare module 'bad-words' {
  class Filter {
    constructor(options?: { placeholder?: string; list?: string[] });
    clean(text: string): string;
    isProfane(text: string): boolean;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
  }
  
  // Export as default and named export to support both import styles
  export = Filter;
  export default Filter;
}
