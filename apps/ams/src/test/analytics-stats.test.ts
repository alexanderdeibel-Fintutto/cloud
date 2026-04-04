import { describe, it, expect } from 'vitest';

describe('Analytics Stats computation', () => {
  it('should aggregate AI usage data by date', () => {
    const aiUsage = [
      { date: '2025-01-01', total_requests: 100, total_cost_usd: 0.5, total_tokens: 5000, avg_response_time_ms: 200, app_id: 'app1' },
      { date: '2025-01-01', total_requests: 50, total_cost_usd: 0.3, total_tokens: 3000, avg_response_time_ms: 150, app_id: 'app2' },
      { date: '2025-01-02', total_requests: 200, total_cost_usd: 1.0, total_tokens: 10000, avg_response_time_ms: 300, app_id: 'app1' },
    ];

    const totalRequests = aiUsage.reduce((sum, d) => sum + (d.total_requests || 0), 0);
    const totalCost = aiUsage.reduce((sum, d) => sum + (d.total_cost_usd || 0), 0);
    const avgResponseTime = aiUsage.length
      ? aiUsage.reduce((sum, d) => sum + (d.avg_response_time_ms || 0), 0) / aiUsage.length
      : 0;

    expect(totalRequests).toBe(350);
    expect(totalCost).toBeCloseTo(1.8);
    expect(Math.round(avgResponseTime)).toBe(217);
  });

  it('should group by date for charts', () => {
    const data = [
      { date: '2025-01-01', total_requests: 100, total_cost_usd: 0.5, total_tokens: 5000 },
      { date: '2025-01-01', total_requests: 50, total_cost_usd: 0.3, total_tokens: 3000 },
      { date: '2025-01-02', total_requests: 200, total_cost_usd: 1.0, total_tokens: 10000 },
    ];

    const byDate = new Map<string, { date: string; requests: number; cost: number; tokens: number }>();
    data.forEach(d => {
      const date = d.date;
      const existing = byDate.get(date) || { date, requests: 0, cost: 0, tokens: 0 };
      existing.requests += d.total_requests;
      existing.cost += d.total_cost_usd;
      existing.tokens += d.total_tokens;
      byDate.set(date, existing);
    });

    const chart = Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));

    expect(chart.length).toBe(2);
    expect(chart[0].requests).toBe(150);
    expect(chart[0].tokens).toBe(8000);
    expect(chart[1].requests).toBe(200);
  });

  it('should compute support stats correctly', () => {
    const requests = [
      { status: 'open', urgency: 'high', category: 'billing', completed_at: null },
      { status: 'pending', urgency: 'normal', category: 'technical', completed_at: null },
      { status: 'completed', urgency: 'low', category: 'billing', completed_at: '2025-01-15' },
      { status: 'completed', urgency: 'urgent', category: 'technical', completed_at: new Date().toISOString() },
    ];

    const open = requests.filter(r => r.status === 'open' || r.status === 'pending');
    const urgent = requests.filter(r => r.urgency === 'high' || r.urgency === 'urgent' || r.urgency === 'critical');

    expect(open.length).toBe(2);
    expect(urgent.length).toBe(2);
  });

  it('should compute AI model breakdown', () => {
    const logs = [
      { model_name: 'gpt-4', total_tokens: 1000, cost_usd: 0.05 },
      { model_name: 'gpt-4', total_tokens: 2000, cost_usd: 0.10 },
      { model_name: 'claude-3', total_tokens: 500, cost_usd: 0.02 },
    ];

    const modelMap = new Map<string, { model: string; requests: number; tokens: number; cost: number }>();
    logs.forEach(l => {
      const model = l.model_name;
      const existing = modelMap.get(model) || { model, requests: 0, tokens: 0, cost: 0 };
      existing.requests++;
      existing.tokens += l.total_tokens;
      existing.cost += l.cost_usd;
      modelMap.set(model, existing);
    });

    const byModel = Array.from(modelMap.values()).sort((a, b) => b.requests - a.requests);

    expect(byModel.length).toBe(2);
    expect(byModel[0].model).toBe('gpt-4');
    expect(byModel[0].requests).toBe(2);
    expect(byModel[0].tokens).toBe(3000);
    expect(byModel[1].model).toBe('claude-3');
  });
});
