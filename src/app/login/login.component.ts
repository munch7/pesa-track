import { Component } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserCredential } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
  ],
  standalone: true,
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService) {}

  // login() {
  //   this.authService.login(this.email.trim(), this.password.trim())
  //   .then(user => {
  //     this.router.navigate(['/dashboard']);
  //     console.log('Logged in:', user)
  //     })
  //   .catch(err => console.error('Login error:', err));
  // }

  async login() {
    try {
      const userCredential: UserCredential = await this.authService.login(this.email, this.password);
      console.log('Logged in:', userCredential.user);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error('Login error:', err);
    }
  }
}
