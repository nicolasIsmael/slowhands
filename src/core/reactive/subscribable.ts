export type Unsubscribe = () => void;

export interface Subscribable<T> {
  subscribe(onValue: (value: T) => void, onError: (error: unknown) => void): Unsubscribe;
}
