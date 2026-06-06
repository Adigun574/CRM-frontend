import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Ticket {
  _id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  customer: { name: string; email: string; phone?: string };
  assignedTo?: any;
  assignedToName?: string;
  createdBy?: any;
  resolvedAt?: string;
  comments: any[];
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TicketService {
  private url = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getTickets(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v as string); });
    return this.http.get<{ tickets: Ticket[]; total: number }>(this.url, { params });
  }

  getTicketById(id: string) {
    return this.http.get<Ticket>(`${this.url}/${id}`);
  }

  createTicket(data: Partial<Ticket>) {
    return this.http.post<Ticket>(this.url, data);
  }

  updateTicket(id: string, data: Partial<Ticket>) {
    return this.http.put<Ticket>(`${this.url}/${id}`, data);
  }

  resolveTicket(id: string) {
    return this.http.patch<Ticket>(`${this.url}/${id}/resolve`, {});
  }

  addComment(id: string, text: string) {
    return this.http.post<Ticket>(`${this.url}/${id}/comment`, { text });
  }

  deleteTicket(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
