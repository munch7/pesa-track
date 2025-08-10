import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';

  register() {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.register(this.email, this.password)
    .then(userCredential => {
      this.successMessage = 'Registration successful!, Redirecting ...';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      console.log('Successo',userCredential);
    })
    .catch(err => {
      this.errorMessage = err.message;
      console.error('Failure', err);
    });
  }
}
