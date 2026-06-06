import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TitleCasePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  auth = inject(AuthService);
  user = this.auth.currentUser;

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['admin', 'sales', 'support'] },
    { label: 'Contacts', icon: 'contacts', route: '/contacts', roles: ['admin', 'sales', 'support'] },
    { label: 'Accounts', icon: 'business', route: '/accounts', roles: ['admin', 'sales', 'support'] },
    { label: 'Leads', icon: 'trending_up', route: '/leads', roles: ['admin', 'sales'] },
    { label: 'Tickets', icon: 'confirmation_number', route: '/tickets', roles: ['admin', 'sales', 'support'] },
    { label: 'Users', icon: 'manage_accounts', route: '/users', roles: ['admin'] },
  ];

  get visibleNav() {
    return this.navItems.filter(item => item.roles.includes(this.user()?.role || ''));
  }

  logout() { this.auth.logout(); }
}
