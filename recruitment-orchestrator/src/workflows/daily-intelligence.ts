/**
 * Workflow 3: Daily Intelligence Briefing
 * Automated morning briefing with market trends, salary updates, and pipeline metrics
 */

import { WorkflowDefinition } from '../types/workflows.js';

export const dailyIntelligenceWorkflow: WorkflowDefinition = {
  name: 'daily_intelligence',
  description: 'Generate automated daily intelligence briefing with market trends and pipeline metrics',
  trigger: 'manual', // Can be changed to 'scheduled' with cron

  steps: [
    {
      name: 'get_market_trends',
      mcp: 'recruitment-trends',
      tool: 'get_daily_trends',
      params: {},
      output: 'trends',
      on_error: 'continue',
      retry: {
        max_attempts: 2,
        delay: 2000
      }
    },

    {
      name: 'get_salary_changes',
      mcp: 'salary-benchmark',
      tool: 'get_market_changes',
      params: {
        timeframe: '24h'
      },
      output: 'salary_changes',
      on_error: 'continue',
      retry: {
        max_attempts: 2,
        delay: 1000
      }
    },

    {
      name: 'get_pipeline_deals',
      mcp: 'pipedrive-automation',
      tool: 'search_deals',
      params: {
        term: '',
        limit: 100
      },
      output: 'all_deals',
      retry: {
        max_attempts: 3,
        delay: 2000
      }
    },

    {
      name: 'calculate_pipeline_metrics',
      local: 'javascript',
      code: `
        const deals = all_deals?.items || all_deals || [];
        const open_deals = deals.filter(d => d.status === 'open');
        const won_deals = deals.filter(d => d.status === 'won');
        const lost_deals = deals.filter(d => d.status === 'lost');
        
        const total_pipeline_value = open_deals.reduce((sum, d) => sum + (d.value || 0), 0);
        const won_value = won_deals.reduce((sum, d) => sum + (d.value || 0), 0);
        
        return {
          open_count: open_deals.length,
          won_count: won_deals.length,
          lost_count: lost_deals.length,
          total_pipeline_value: Math.round(total_pipeline_value),
          won_value: Math.round(won_value),
          conversion_rate: deals.length > 0 ? Math.round((won_deals.length / deals.length) * 100) : 0,
          avg_deal_value: open_deals.length > 0 ? Math.round(total_pipeline_value / open_deals.length) : 0
        };
      `,
      output: 'pipeline_metrics'
    },

    {
      name: 'generate_intelligence_report',
      local: 'markdown',
      template: `# 📊 Daily Intelligence Brief - \${new Date().toLocaleDateString('nl-NL')}

## 🔥 Market Trends

\${context.trends?.summary || 'Trends data niet beschikbaar'}

**Top Skills in Demand:**
\${context.trends?.top_skills ? context.trends.top_skills.map((s, i) => \`\${i + 1}. \${s}\`).join('\\n') : 'N/A'}

**Hiring Signals:**
\${context.trends?.hiring_signals || 'N/A'}

**Market Activity:** \${context.trends?.activity_level || 'Normal'}

---

## 💰 Salary Changes (Last 24h)

\${context.salary_changes?.biggest_movers || 'No significant changes'}

**Average Movement:** \${context.salary_changes?.avg_change || 'N/A'}

**Roles with Increases:**
\${context.salary_changes?.increases ? context.salary_changes.increases.join(', ') : 'N/A'}

**Roles with Decreases:**
\${context.salary_changes?.decreases ? context.salary_changes.decreases.join(', ') : 'N/A'}

---

## 📈 Pipeline Metrics

**Open Deals:** \${context.pipeline_metrics?.open_count || 0}
**Total Pipeline Value:** €\${(context.pipeline_metrics?.total_pipeline_value || 0).toLocaleString()}
**Average Deal Value:** €\${(context.pipeline_metrics?.avg_deal_value || 0).toLocaleString()}

**This Week:**
- Won: \${context.pipeline_metrics?.won_count || 0} deals (€\${(context.pipeline_metrics?.won_value || 0).toLocaleString()})
- Lost: \${context.pipeline_metrics?.lost_count || 0} deals
- Conversion Rate: \${context.pipeline_metrics?.conversion_rate || 0}%

---

## 🎯 Action Items

\${(context.pipeline_metrics?.conversion_rate || 0) < 20 ? '⚠️ **Low conversion rate** - Review pipeline stages and follow-up processes' : ''}
\${(context.pipeline_metrics?.open_count || 0) > 50 ? '⚠️ **High pipeline volume** - Consider prioritization or additional resources' : ''}
\${(context.trends?.demand_score || 0) > 80 ? '🔥 **High market demand** - Great time for active sourcing!' : ''}
\${(context.salary_changes?.avg_change || 0) > 5 ? '💰 **Significant salary movements** - Review compensation packages' : ''}

---

*Generated: \${new Date().toISOString()}*
*Workflow: daily_intelligence*`,
      output: 'report_markdown'
    }
  ],

  return: {
    report: '${report_markdown}',
    date: '${new Date().toLocaleDateString("nl-NL")}',
    open_deals: '${pipeline_metrics.open_count}',
    pipeline_value: '${pipeline_metrics.total_pipeline_value}',
    conversion_rate: '${pipeline_metrics.conversion_rate}',
    top_skill: '${trends?.top_skills?.[0] || "N/A"}',
    market_activity: '${trends?.activity_level || "Normal"}',
    status: 'completed'
  }
};
