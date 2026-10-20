import { IDataStore } from './interface.js';
import { PrismaStore } from './prismaStore.js';
import { InMemoryStore } from './inMemoryStore.js';

let currentStore: IDataStore = new PrismaStore();

export function getStore(): IDataStore {
  return currentStore;
}

export function setStore(store: IDataStore): void {
  currentStore = store;
}

export function useInMemoryStore(): void {
  currentStore = new InMemoryStore();
}

export function usePrismaStore(): void {
  currentStore = new PrismaStore();
}
