import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Sun, Thermometer, Droplets, Wind, Loader2, RefreshCw } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuildings } from '@/hooks/useBuildings';
import { WeatherData, formatNumber } from '@/types/database';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { de } from 'date-fns/locale';

// Open-Meteo API (kostenlos, kein API-Key nötig)
async function fetchWeatherData(lat: number, lon: number, days: number = 90): Promise<WeatherData[]> {
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  try {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max,sunshine_duration,precipitation_sum,windspeed_10m_max&timezone=Europe/Berlin`
    );
    const data = await response.json();

    if (!data.daily) return [];

    return data.daily.time.map((date: string, i: number) => {
      const tempAvg = data.daily.temperature_2m_mean?.[i] ?? null;
      const heatingBase = 20;
      const hdd = tempAvg !== null && tempAvg < heatingBase ? heatingBase - tempAvg : 0;

      return {
        id: `${date}`,
        building_id: '',
        date,
        temp_avg: tempAvg,
        temp_min: data.daily.temperature_2m_min?.[i] ?? null,
        temp_max: data.daily.temperature_2m_max?.[i] ?? null,
        sunshine_hours: data.daily.sunshine_duration?.[i] ? data.daily.sunshine_duration[i] / 3600 : null,
        precipitation_mm: data.daily.precipitation_sum?.[i] ?? null,
        heating_degree_days: Math.round(hdd * 10) / 10,
        solar_radiation_kwh: null,
        source: 'open-meteo',
      };
    });
  } catch (error) {
    console.error('Weather fetch error:', error);
    return [];
  }
}

// Default coordinates (Munich)
const DEFAULT_LAT = 48.1351;
const DEFAULT_LON = 11.5820;

export default function WeatherCorrelation() {
  const navigate = useNavigate();
  const { buildings } = useBuildings();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');

  useEffect(() => {
    loadWeather();
  }, []);

  const loadWeather = async () => {
    setLoading(true);
    const data = await fetchWeatherData(DEFAULT_LAT, DEFAULT_LON, 90);
    setWeatherData(data);
    setLoading(false);
  };

  // Current weather (latest data point)
  const currentWeather = weatherData.length > 0 ? weatherData[weatherData.length - 1] : null;

  // Weekly aggregation for charts
  const weeklyData = useMemo(() => {
    if (weatherData.length === 0) return [];
    const weeks: { week: string; avgTemp: number; sunHours: number; hdd: number; precipitation: number }[] = [];

    for (let i = 0; i < weatherData.length; i += 7) {
      const weekSlice = weatherData.slice(i, Math.min(i + 7, weatherData.length));
      if (weekSlice.length === 0) continue;

      const avgTemp = weekSlice.reduce((sum, d) => sum + (d.temp_avg || 0), 0) / weekSlice.length;
      const sunHours = weekSlice.reduce((sum, d) => sum + (d.sunshine_hours || 0), 0);
      const hdd = weekSlice.reduce((sum, d) => sum + (d.heating_degree_days || 0), 0);
      const precipitation = weekSlice.reduce((sum, d) => sum + (d.precipitation_mm || 0), 0);

      weeks.push({
        week: format(new Date(weekSlice[0].date), 'dd.MM', { locale: de }),
        avgTemp: Math.round(avgTemp * 10) / 10,
        sunHours: Math.round(sunHours * 10) / 10,
        hdd: Math.round(hdd * 10) / 10,
        precipitation: Math.round(precipitation * 10) / 10,
      });
    }
    return weeks;
  }, [weatherData]);

  // Total heating degree days
  const totalHDD = weatherData.reduce((sum, d) => sum + (d.heating_degree_days || 0), 0);
  const totalSunHours = weatherData.reduce((sum, d) => sum + (d.sunshine_hours || 0), 0);

  return (
    <AppLayout>
      <Button variant="ghost" className="mb-4 -ml-2" onClick={() => navigate('/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" />Zurück
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Wetterdaten</h1>
        <Button variant="outline" size="sm" onClick={loadWeather} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <Card className="mb-4 glass-card border-0">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-2">
              {format(new Date(currentWeather.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
            </p>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <Thermometer className="w-5 h-5 mx-auto text-red-400 mb-1" />
                <p className="text-lg font-bold">{currentWeather.temp_avg?.toFixed(1)}°</p>
                <p className="text-[10px] text-muted-foreground">Temperatur</p>
              </div>
              <div className="text-center">
                <Sun className="w-5 h-5 mx-auto text-yellow-400 mb-1" />
                <p className="text-lg font-bold">{currentWeather.sunshine_hours?.toFixed(1)}h</p>
                <p className="text-[10px] text-muted-foreground">Sonne</p>
              </div>
              <div className="text-center">
                <Droplets className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                <p className="text-lg font-bold">{currentWeather.precipitation_mm?.toFixed(0)}mm</p>
                <p className="text-[10px] text-muted-foreground">Regen</p>
              </div>
              <div className="text-center">
                <Cloud className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                <p className="text-lg font-bold">{currentWeather.heating_degree_days?.toFixed(1)}</p>
                <p className="text-[10px] text-muted-foreground">HGT</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Heizgradtage (90T)</p>
            <p className="text-lg font-bold">{formatNumber(totalHDD, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Höher = mehr Heizbedarf</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Sonnenstunden (90T)</p>
            <p className="text-lg font-bold">{formatNumber(totalSunHours, 0)}h</p>
            <p className="text-[10px] text-muted-foreground">Relevant für PV-Ertrag</p>
          </CardContent>
        </Card>
      </div>

      {/* Temperature + HDD Chart */}
      {weeklyData.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Temperatur & Heizgradtage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="temp" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="hdd" orientation="right" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line yAxisId="temp" type="monotone" dataKey="avgTemp" name="Ø Temp (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Bar yAxisId="hdd" dataKey="hdd" name="Heizgradtage" fill="hsl(var(--primary))" opacity={0.3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sunshine Chart */}
      {weeklyData.length > 0 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sonnenstunden & Niederschlag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="sunHours" name="Sonnenstunden" fill="#eab308" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="precipitation" name="Niederschlag (mm)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">
            <strong>Heizgradtage (HGT)</strong> beschreiben den Heizbedarf: Je kälter es draußen ist, desto mehr HGT.
            Damit lässt sich der Heizverbrauch witterungsbereinigt vergleichen.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Datenquelle:</strong> Open-Meteo Archive API (kostenlos, Standort: München)
          </p>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">Wetterdaten laden...</p>
        </div>
      )}
    </AppLayout>
  );
}
