import { inject, Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({ 
  providedIn: 'root' 
})

export class AuthService {
  private auth = inject(Auth);

  register(name: string, email: string, password: string, location: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  get currentUser$() {
    return this.auth.currentUser;
  }
}
