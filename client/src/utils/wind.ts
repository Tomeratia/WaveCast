const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function degreesToCompass(deg: number): string {
  return COMPASS[Math.round(deg / 22.5) % 16] ?? 'N';
}

export function swellDirectionLabel(deg: number): string {
  return `${degreesToCompass(deg)} ${Math.round(deg)}°`;
}
