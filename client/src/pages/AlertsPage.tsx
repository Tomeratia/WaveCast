import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Trash2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAlerts, createAlert, deleteAlert, type AlertDTO } from '../services/alertsClient';
import { DEMO_SPOTS } from '../data/spots';

const SCORE_LABELS: Record<string, string> = {
  dawn: 'Dawn patrol (5–9 am)',
  morning: 'Morning (9 am–1 pm)',
  sunset: 'Sunset (4–7 pm)',
  any: 'Any time',
};

function scoreBadge(score: number) {
  if (score >= 80) return 'bg-score-epic text-white';
  if (score >= 60) return 'bg-score-good text-white';
  if (score >= 40) return 'bg-score-fair text-black';
  if (score >= 20) return 'bg-score-poor text-white';
  return 'bg-gray-700 text-gray-300';
}

function spotName(spotId: string) {
  return DEMO_SPOTS.find((s) => s.id === spotId)?.name ?? spotId;
}

export function AlertsPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formSpot, setFormSpot] = useState(DEMO_SPOTS[0]?.id ?? '');
  const [formScore, setFormScore] = useState(60);
  const [formTime, setFormTime] = useState<'dawn' | 'morning' | 'sunset' | 'any'>('any');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) { setLoading(false); return; }
    getAlerts(accessToken)
      .then(setAlerts)
      .catch(() => setError('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, [accessToken]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setCreating(true);
    try {
      const alert = await createAlert(accessToken, { spotId: formSpot, minScore: formScore, timePref: formTime });
      setAlerts((prev) => [alert, ...prev]);
      setShowForm(false);
    } catch {
      setError('Failed to create alert');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(alertId: string) {
    if (!accessToken) return;
    setDeleting(alertId);
    try {
      await deleteAlert(accessToken, alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch {
      setError('Failed to delete alert');
    } finally {
      setDeleting(null);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Bell className="mx-auto mb-4 h-12 w-12 text-ocean-400" />
        <h1 className="text-xl font-semibold text-white">Sign in to set up surf alerts</h1>
        <p className="mt-2 text-gray-400">Get an email when your spot reaches your target score.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-ocean-500 px-5 py-2.5 font-semibold text-white hover:bg-ocean-600"
        >
          <LogIn className="h-4 w-4" /> Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ocean-200">
          <Bell className="h-6 w-6 text-ocean-400" /> Surf Alerts
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-ocean-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-600"
        >
          <Plus className="h-4 w-4" /> New alert
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-900/40 border border-red-700 px-4 py-3 text-red-300 text-sm">{error}</div>
      )}

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 rounded-xl border border-ocean-700 bg-gray-900 p-5 space-y-4"
        >
          <h2 className="font-semibold text-white">New surf alert</h2>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Spot</label>
            <select
              value={formSpot}
              onChange={(e) => setFormSpot(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:border-ocean-500 focus:outline-none"
            >
              {DEMO_SPOTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.country}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Minimum score: <span className="font-bold text-white">{formScore}</span>
            </label>
            <input
              type="range"
              min={20}
              max={90}
              step={5}
              value={formScore}
              onChange={(e) => setFormScore(Number(e.target.value))}
              className="w-full accent-ocean-500"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Fair (20)</span><span>Good (60)</span><span>Epic (90)</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Time of day</label>
            <div className="flex gap-2 flex-wrap">
              {(['dawn', 'morning', 'sunset', 'any'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormTime(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium border transition-colors ${
                    formTime === t
                      ? 'bg-ocean-500 border-ocean-500 text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {SCORE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-ocean-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ocean-600 disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create alert'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:border-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <div className="py-16 text-center text-gray-400">Loading…</div>}

      {!loading && alerts.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-gray-700 bg-gray-900 p-12 text-center">
          <Bell className="mx-auto mb-4 h-10 w-10 text-gray-600" />
          <p className="text-gray-400">No alerts yet. Create one to get notified by email when conditions are right.</p>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-5 py-4"
            >
              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${scoreBadge(alert.minScore)}`}>
                  {alert.minScore}+
                </span>
                <div>
                  <p className="font-semibold text-white">{spotName(alert.spotId)}</p>
                  <p className="text-sm text-gray-400">{SCORE_LABELS[alert.timePref] ?? alert.timePref}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                disabled={deleting === alert.id}
                className="rounded-lg p-2 text-gray-600 hover:bg-red-900/30 hover:text-red-400 transition-colors disabled:opacity-40"
                title="Delete alert"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
