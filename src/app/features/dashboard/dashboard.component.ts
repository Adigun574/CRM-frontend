import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import {
  Chart, CategoryScale, LinearScale, BarElement, ArcElement,
  LineElement, PointElement, Tooltip, Legend, Title,
} from 'chart.js';
import { AnalyticsService } from '../../core/services/analytics.service';
import { AuthService } from '../../core/services/auth.service';
import { ReplacePipe } from '../../shared/replace.pipe';

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend, Title);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective, ReplacePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  auth = inject(AuthService);
  user = this.auth.currentUser;

  stats: any = {};
  recentLeads: any[] = [];
  recentTickets: any[] = [];
  loading = true;

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1e2d40', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(124,58,237,0.3)', borderWidth: 1, padding: 12, cornerRadius: 8 },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', precision: 0 }, beginAtZero: true },
    },
  };

  doughnutData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 12 }, usePointStyle: true } },
      tooltip: { backgroundColor: '#1e2d40', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, cornerRadius: 8 },
    },
  };

  stageData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.analytics.getDashboardStats().subscribe(stats => { this.stats = stats; });
    this.analytics.getLeadsByMonth().subscribe(data => {
      this.barChartData = {
        labels: data.map(d => MONTH_NAMES[d.month - 1]),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: 'rgba(124,58,237,0.6)',
          borderColor: '#7c3aed',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: 'rgba(124,58,237,0.9)',
        }],
      };
    });
    this.analytics.getTicketsByStatus().subscribe(data => {
      const colors: Record<string, string> = { Open: '#ef4444', 'In Progress': '#f59e0b', Pending: '#6366f1', Resolved: '#10b981', Closed: '#64748b' };
      this.doughnutData = {
        labels: data.map(d => d.status),
        datasets: [{ data: data.map(d => d.count), backgroundColor: data.map(d => colors[d.status] || '#94a3b8'), borderColor: '#0d1b2a', borderWidth: 3 }],
      };
    });
    this.analytics.getLeadsByStage().subscribe(data => {
      const stageColors = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6','#64748b'];
      this.stageData = {
        labels: data.map(d => d.stage),
        datasets: [{ data: data.map(d => d.count), backgroundColor: stageColors, borderColor: '#0d1b2a', borderWidth: 3 }],
      };
    });
    this.analytics.getRecentActivity().subscribe(({ recentLeads, recentTickets }) => {
      this.recentLeads = recentLeads;
      this.recentTickets = recentTickets;
      this.loading = false;
    });
  }

  today = new Date();

  formatCurrency(val: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);
  }

  getPriorityClass(p: string) { return p?.toLowerCase(); }

  getStatusClass(s: string) { return s?.toLowerCase().replace(' ', '-'); }
}
