import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type HeightUnit = 'm' | 'ft';
export type SpeedUnit = 'kmh' | 'mph' | 'kts';

interface UnitsContextValue {
  heightUnit: HeightUnit;
  speedUnit: SpeedUnit;
  setHeightUnit: (u: HeightUnit) => void;
  setSpeedUnit: (u: SpeedUnit) => void;
  formatHeight: (meters: number) => string;
  formatSpeed: (kmh: number) => string;
}

const UnitsContext = createContext<UnitsContextValue | null>(null);

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('m');
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>('kmh');

  function formatHeight(meters: number): string {
    if (heightUnit === 'ft') return `${(meters * 3.281).toFixed(1)} ft`;
    return `${meters.toFixed(1)} m`;
  }

  function formatSpeed(kmh: number): string {
    if (speedUnit === 'mph') return `${(kmh * 0.621).toFixed(0)} mph`;
    if (speedUnit === 'kts') return `${(kmh * 0.540).toFixed(0)} kts`;
    return `${kmh.toFixed(0)} km/h`;
  }

  return (
    <UnitsContext.Provider value={{ heightUnit, speedUnit, setHeightUnit, setSpeedUnit, formatHeight, formatSpeed }}>
      {children}
    </UnitsContext.Provider>
  );
}

export function useUnits(): UnitsContextValue {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error('useUnits must be used inside UnitsProvider');
  return ctx;
}
