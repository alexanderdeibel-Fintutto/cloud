import { createContext, useContext, ReactNode } from 'react';
import { usePlantStore } from './usePlantStore';

type PlantStoreType = ReturnType<typeof usePlantStore>;

const PlantContext = createContext<PlantStoreType | undefined>(undefined);

export function PlantProvider({ children }: { children: ReactNode }) {
  const store = usePlantStore();

  return (
    <PlantContext.Provider value={store}>
      {children}
    </PlantContext.Provider>
  );
}

export function usePlants() {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlants must be used within a PlantProvider');
  }
  return context;
}
