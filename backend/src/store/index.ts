import { IDataStore } from './interface.js';
import { InMemoryStore } from './inMemoryStore.js';

let currentStore: IDataStore = new InMemoryStore();

export function getStore(): IDataStore {
  return currentStore;
}

export function setStore(store: IDataStore): void {
  currentStore = store;
}
