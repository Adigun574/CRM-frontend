import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User, AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  auth = inject(AuthService);

  users: User[] = [];
  loading = signal(true);
  showForm = signal(false);
  editingUser: User | null = null;
  formError = '';
  formLoading = false;

  form: any = { name: '', email: '', password: '', role: 'sales', isActive: true };

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (users) => { this.users = users; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingUser = null;
    this.form = { name: '', email: '', password: '', role: 'sales', isActive: true };
    this.formError = '';
    this.showForm.set(true);
  }

  openEdit(user: User) {
    this.editingUser = user;
    this.form = { name: user.name, email: user.email, role: user.role, isActive: user.isActive, password: '' };
    this.formError = '';
    this.showForm.set(true);
  }

  save() {
    this.formLoading = true;
    this.formError = '';
    const data = { ...this.form };
    if (this.editingUser && !data.password) delete data.password;

    const obs = this.editingUser
      ? this.userService.updateUser(this.editingUser._id, data)
      : this.userService.createUser(data);

    obs.subscribe({
      next: () => { this.formLoading = false; this.showForm.set(false); this.loadUsers(); },
      error: (err) => { this.formError = err.error?.message || 'Operation failed.'; this.formLoading = false; },
    });
  }

  toggleActive(user: User) {
    this.userService.updateUser(user._id, { isActive: !user.isActive }).subscribe(() => this.loadUsers());
  }

  deleteUser(user: User) {
    if (user._id === this.auth.currentUser()?._id) { alert('You cannot delete your own account!'); return; }
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    this.userService.deleteUser(user._id).subscribe(() => this.loadUsers());
  }
}
