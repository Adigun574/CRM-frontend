import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private url = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers() { return this.http.get<User[]>(this.url); }
  getAgents() { return this.http.get<User[]>(`${this.url}/agents`); }
  createUser(data: any) { return this.http.post<User>(this.url, data); }
  updateUser(id: string, data: any) { return this.http.put<User>(`${this.url}/${id}`, data); }
  deleteUser(id: string) { return this.http.delete(`${this.url}/${id}`); }
}
