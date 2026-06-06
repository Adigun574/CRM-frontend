import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  showPassword = false;

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error?.message || 'Login failed. Please check your credentials.');
        this.loading.set(false);
      },
    });
  }

  fillDemo(role: 'admin' | 'sales' | 'support') {
    const creds: Record<string, { email: string; password: string }> = {
      admin:   { email: 'admin@crm.com',   password: 'admin123' },
      sales:   { email: 'sales@crm.com',   password: 'sales123' },
      support: { email: 'support@crm.com', password: 'support123' },
    };
    this.email = creds[role].email;
    this.password = creds[role].password;
  }
}
