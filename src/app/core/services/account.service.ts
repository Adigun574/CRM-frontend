import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Account {
  _id: string;
  name: string;
  type: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: { street?: string; city?: string; state?: string; country?: string };
  employees: number;
  annualRevenue: number;
  description: string;
  assignedTo?: any;
  assignedToName?: string;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface AccountsResponse {
  accounts: Account[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private url = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAccounts(filters: any = {}) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params = params.set(k, v as string); });
    return this.http.get<AccountsResponse>(this.url, { params });
  }

  getAccountById(id: string) {
    return this.http.get<Account>(`${this.url}/${id}`);
  }

  createAccount(data: Partial<Account>) {
    return this.http.post<Account>(this.url, data);
  }

  updateAccount(id: string, data: Partial<Account>) {
    return this.http.put<Account>(`${this.url}/${id}`, data);
  }

  deleteAccount(id: string) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
