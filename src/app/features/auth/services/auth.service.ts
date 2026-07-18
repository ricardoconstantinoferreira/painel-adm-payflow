import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { LoginPayload } from '../interfaces/login-payload.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.1:8080/api/payflow/auth/login';

  login(payload: LoginPayload): Observable<unknown> {
    return this.http.post(this.apiUrl, payload);
  }
}
