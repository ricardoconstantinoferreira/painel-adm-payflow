import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthSessionService } from '../../../services/auth-session.service';

interface InstallmentConfigPayload {
  installments: number;
  fees: number;
  minimalAmount: number;
  storeId: string;
}

@Injectable({
  providedIn: 'root',
})
export class InstallmentRulesService {
  private readonly http = inject(HttpClient);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly apiUrl = 'http://127.0.1:8080/api/payflow/store/config';

  getStoreConfig(): Observable<any> {
    const token = this.authSessionService.getToken();
    const headers = this.buildHeaders(token);

    return this.http.get<any>(this.apiUrl, { headers });
  }

  createStoreConfig(payload: InstallmentConfigPayload): Observable<unknown> {
    const token = this.authSessionService.getToken();
    const headers = this.buildHeaders(token);

    return this.http.post<unknown>(this.apiUrl, payload, { headers });
  }

  getLoggedStoreId(): string | null {
    return this.authSessionService.getStoreId();
  }

  private buildHeaders(token: string | null): HttpHeaders | undefined {
    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
        })
      : undefined;
  }
}
