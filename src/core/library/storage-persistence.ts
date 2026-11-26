/** Asks the device to keep the library instead of clearing it when space runs low. */
export interface StoragePersistence {
  request(): Promise<boolean>;
}
