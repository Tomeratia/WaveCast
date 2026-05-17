import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SpotCard } from '../../components/ui/SpotCard';
import type { SpotDTO } from '@shared/types';

vi.mock('../../services/weatherClient', () => ({
  fetchForecast: vi.fn(),
}));

import { fetchForecast } from '../../services/weatherClient';

const spot: SpotDTO = {
  id: 'spot-1',
  name: 'Pipeline',
  region: 'Oahu',
  country: 'USA',
  lat: 21.66,
  lng: -158.05,
};

const mockForecast = {
  time: new Date().toISOString(),
  swellHeight: 2.0,
  swellPeriod: 12,
  swellDirection: 270,
  windSpeed: 5,
  windDirection: 90,
  waterTemp: 24,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SpotCard', () => {
  it('renders spot name and location', async () => {
    vi.mocked(fetchForecast).mockResolvedValue([mockForecast]);

    render(
      <MemoryRouter>
        <SpotCard spot={spot} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Pipeline')).toBeInTheDocument();
    expect(screen.getByText(/Oahu/)).toBeInTheDocument();
  });

  it('shows a score badge after forecast loads', async () => {
    vi.mocked(fetchForecast).mockResolvedValue([mockForecast]);

    render(
      <MemoryRouter>
        <SpotCard spot={spot} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument(); // spinner gone
    });

    const badge = screen.getByText(/flat|poor|fair|good|epic/i);
    expect(badge).toBeInTheDocument();
  });

  it('shows N/A when forecast fetch fails', async () => {
    vi.mocked(fetchForecast).mockRejectedValue(new Error('network'));

    render(
      <MemoryRouter>
        <SpotCard spot={spot} />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });
});
