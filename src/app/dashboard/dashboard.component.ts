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
    const foldersRef = collection(this.afs, `users/${this.user.uid}/folders`);
    collectionData(foldersRef, { idField: 'id' })
      .pipe(map((folders) => folders.map((f: any) => ({ id: f.id }))))
      .subscribe((folders) => {
        this.folders = folders;
        this.getFolderTotals();
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
      const entriesRef = collection(
        this.afs,
        `users/${this.user.uid}/folders/${folder.id}/entries`
      );
      collectionData(entriesRef).subscribe((entries: any[]) => {
        this.folderTotals[folder.id] = entries.reduce(
          (sum, entry) => sum + (+entry.amount || 0),
          0
        );
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
