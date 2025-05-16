declare module 'ttl-set' {
  export class TTLSet<T> {
    constructor(ttl: number);
    
    /**
     * Adds the given value to the TTLSet
     */
    add(value: T): void;
    
    /**
     * Clear all previously added values to the TTLSet
     */
    clear(): void;
    
    /**
     * Returns true if the TTLSet contains the given value
     */
    has(value: T): boolean;
    
    /**
     * The number of elements in the TTLSet
     */
    readonly size: number;
  }
} 