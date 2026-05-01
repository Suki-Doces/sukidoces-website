import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ToastMessage {
  title: string;
  text: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastSubject = new Subject<ToastMessage>();
  toastState$ = this.toastSubject.asObservable();

  showSuccess(title: string, message: string) {
    this.toastSubject.next({ title, text: message, type: 'success' });
  }

  showError(title: string, message: string) {
    this.toastSubject.next({ title, text: message, type: 'error' });
  }
}