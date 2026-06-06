import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Lead {
  _id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  dealValue: number;
  stage: string;
  priority: string;
  source: string;
  assignedTo?: any;
  assignedToName?: string;
  notes: string;
  activities: any[];
  expectedCloseDate?: string;
  createdAt: string;
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class LeadService {
  private url = `${environment.apiUrl}/leads`;

  constructor(private http: HttpClient) {}

  getLeads(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v as string); });
    return this.http.get<LeadsResponse>(this.url, { params });
  }

  getLeadById(id: string) {
    return this.http.get<Lead>(`${this.url}/${id}`);
  }

  createLead(data: Partial<Lead>) {
    return this.http.post<Lead>(this.url, data);
  }

  updateLead(id: string, data: Partial<Lead>) {
    return this.http.put<Lead>(`${this.url}/${id}`, data);
  }

  deleteLead(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }

  addActivity(id: string, activity: { action: string; note?: string }) {
    return this.http.post<Lead>(`${this.url}/${id}/activity`, activity);
  }
}
