import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { LoginPayload } from '../interfaces/login-payload.interface';
import { AuthSessionService } from '../../../services/auth-session.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly apiUrl = 'http://127.0.1:8080/api/payflow/auth/login';

  login(payload: LoginPayload): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, payload).pipe(
      tap((response) => {
        const token = this.extractToken(response);
        const storeId = this.extractStoreId(response, token);

        if (token) {
          this.authSessionService.setToken(token);
        }

        if (storeId) {
          this.authSessionService.setStoreId(storeId);
        }
      }),
    );
  }

  private extractToken(response: unknown): string | null {
    if (!response || typeof response !== 'object') {
      return null;
    }

    const responseWithToken = response as Record<string, unknown>;
    const possibleToken =
      responseWithToken['token'] ??
      responseWithToken['accessToken'] ??
      responseWithToken['access_token'];

    return typeof possibleToken === 'string' && possibleToken.length > 0
      ? possibleToken
      : null;
  }

  private extractStoreId(
    response: unknown,
    token: string | null,
  ): string | null {
    if (response && typeof response === 'object') {
      const responseRecord = response as Record<string, unknown>;
      const directStoreId =
        responseRecord['store_id'] ??
        responseRecord['storeId'] ??
        responseRecord['id_store'];

      if (typeof directStoreId === 'string' && directStoreId.length > 0) {
        return directStoreId;
      }

      if (typeof directStoreId === 'number') {
        return String(directStoreId);
      }
    }

    if (!token) {
      return null;
    }

    const tokenParts = token.split('.');

    if (tokenParts.length < 2) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(tokenParts[1])) as Record<
        string,
        unknown
      >;
      const tokenStoreId =
        payload['store_id'] ?? payload['storeId'] ?? payload['id_store'];

      if (typeof tokenStoreId === 'string' && tokenStoreId.length > 0) {
        return tokenStoreId;
      }

      if (typeof tokenStoreId === 'number') {
        return String(tokenStoreId);
      }
    } catch {
      return null;
    }

    return null;
  }
}
