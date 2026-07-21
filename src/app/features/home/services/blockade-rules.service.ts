import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthSessionService } from '../../../services/auth-session.service';

interface BlockadePayload {
  qty: number;
  parameter: string;
  typeParameter: number;
}

@Injectable({
  providedIn: 'root',
})
export class BlockadeRulesService {
  private readonly http = inject(HttpClient);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly apiUrl = 'http://127.0.1:8080/api/payflow/blockade';

  getBlockades(): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      headers: this.buildHeaders(),
    });
  }

  createBlockade(payload: BlockadePayload): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, payload, {
      headers: this.buildHeaders(),
    });
  }

  deleteById(ruleId: string): Observable<unknown> {
    return this.http.delete<unknown>(`${this.apiUrl}/${ruleId}`, {
      headers: this.buildHeaders(),
    });
  }

  private buildHeaders(): HttpHeaders | undefined {
    const token = this.authSessionService.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }
}
