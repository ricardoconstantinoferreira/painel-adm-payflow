import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly tokenStorageKey = 'payflow_auth_token';
  private readonly storeIdStorageKey = 'payflow_store_id';

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
  }

  getStoreId(): string | null {
    return localStorage.getItem(this.storeIdStorageKey);
  }

  setStoreId(storeId: string): void {
    localStorage.setItem(this.storeIdStorageKey, storeId);
  }

  clearStoreId(): void {
    localStorage.removeItem(this.storeIdStorageKey);
  }

  clearSession(): void {
    this.clearToken();
    this.clearStoreId();
  }
}
