import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private url = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getDashboardStats() { return this.http.get<any>(`${this.url}/stats`); }
  getLeadsByMonth(year?: number) { return this.http.get<any[]>(`${this.url}/leads-by-month`, { params: year ? { year: year.toString() } : {} }); }
  getLeadsByStage() { return this.http.get<any[]>(`${this.url}/leads-by-stage`); }
  getTicketsByStatus() { return this.http.get<any[]>(`${this.url}/tickets-by-status`); }
  getTicketsByPriority() { return this.http.get<any[]>(`${this.url}/tickets-by-priority`); }
  getRecentActivity() { return this.http.get<any>(`${this.url}/recent-activity`); }
}
