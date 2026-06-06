import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ContactPhone { label: string; number: string; }
export interface ContactSocial { linkedin?: string; twitter?: string; facebook?: string; instagram?: string; }

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phones: ContactPhone[];
  jobTitle: string;
  department: string;
  account?: any;
  accountName?: string;
  reportsTo?: any;
  reportsToName?: string;
  social: ContactSocial;
  address: { street?: string; city?: string; state?: string; country?: string };
  status: string;
  source: string;
  tags: string[];
  notes: string;
  assignedTo?: any;
  assignedToName?: string;
  interactions: any[];
  createdAt: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private url = `${environment.apiUrl}/contacts`;

  constructor(private http: HttpClient) {}

  getContacts(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v as string); });
    return this.http.get<ContactsResponse>(this.url, { params });
  }

  getContactById(id: string) {
    return this.http.get<Contact>(`${this.url}/${id}`);
  }

  createContact(data: Partial<Contact>) {
    return this.http.post<Contact>(this.url, data);
  }

  updateContact(id: string, data: Partial<Contact>) {
    return this.http.put<Contact>(`${this.url}/${id}`, data);
  }

  deleteContact(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }

  addInteraction(id: string, interaction: { type: string; summary: string }) {
    return this.http.post<Contact>(`${this.url}/${id}/interaction`, interaction);
  }
}
