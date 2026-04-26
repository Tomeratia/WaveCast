import { prisma } from '../lib/prisma.js';
import type { SpotDTO } from '@wavecast/shared';
import type { Spot } from '@prisma/client';

function toDTO(spot: Spot): SpotDTO {
  return {
    id: spot.id,
    name: spot.name,
    lat: spot.lat,
    lng: spot.lng,
    country: spot.country,
    region: spot.region,
  };
}

export const spotRepo = {
  async findAll(): Promise<SpotDTO[]> {
    const spots = await prisma.spot.findMany({ orderBy: { name: 'asc' } });
    return spots.map(toDTO);
  },

  async findById(id: string): Promise<SpotDTO | null> {
    const spot = await prisma.spot.findUnique({ where: { id } });
    return spot ? toDTO(spot) : null;
  },

  toDTO,
};
