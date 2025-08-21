import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Auth, signOut, user } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
} from '@angular/fire/firestore';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private afs = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  user: any;
  folders: any[] = [];
  folderTotals: { [key: string]: number } = {};

  folderOpen = false;

  ngOnInit() {
    // 🔹 Listen to logged-in user
    user(this.auth).subscribe(async (u) => {
      if (u) {
        const userDocRef = doc(this.afs, `users/${u.uid}`);
        const snap = await getDoc(userDocRef);
        this.user = snap.exists() ? snap.data() : { displayName: u.displayName, email: u.email };
        this.loadFolders();
      }
    });
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Check if current URL has 'folder' segment
      this.folderOpen = this.router.url.includes('/dashboard/folder');
    });
  }

  loadFolders() {
    console.log('DEBUG: loadFolders → Firestore instance:', this.afs);
    console.log('DEBUG: user id:', this.user?.uid);
  
    const foldersRef = collection(this.afs, `users/${this.user.uid}/folders`);
    console.log('DEBUG: foldersRef:', foldersRef);
  
    collectionData(foldersRef, { idField: 'id' })
      .pipe(map((folders) => folders.map((f: any) => ({ id: f.id }))))
      .subscribe({
        next: (folders) => {
          console.log('DEBUG: folders received:', folders);
          this.folders = folders;
          this.getFolderTotals();
        },
        error: (err) => console.error('🔥 Firestore error in loadFolders:', err)
      });
  }

  createFolder() {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const folderRef = doc(this.afs, `users/${this.user.uid}/folders/${dateStr}`);
    setDoc(folderRef, { created: new Date() }).then(() => {
      this.router.navigate(['/dashboard/folder', dateStr]);
    });
  }

  getFolderTotals() {
    for (let folder of this.folders) {
      console.log('DEBUG: getFolderTotals → folder:', folder.id);
  
      const entriesRef = collection(
        this.afs,
        `users/${this.user.uid}/folders/${folder.id}/entries`
      );
      console.log('DEBUG: entriesRef:', entriesRef);
  
      collectionData(entriesRef).subscribe({
        next: (entries: any[]) => {
          console.log(`DEBUG: entries for ${folder.id}:`, entries);
          this.folderTotals[folder.id] = entries.reduce(
            (sum, entry) => sum + (+entry.amount || 0),
            0
          );
        },
        error: (err) => console.error(`🔥 Firestore error in getFolderTotals for ${folder.id}:`, err)
      });
    }
  }
  
  get todayFolderName(): string {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  get isTfc(): boolean {
    return this.folders.some(folder => folder.id === this.todayFolderName);
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login'])
    });
  }
}
