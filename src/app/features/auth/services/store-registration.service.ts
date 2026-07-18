import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StoreRegistrationPayload } from '../interfaces/store-registration-payload.interface';

@Injectable({
  providedIn: 'root',
})
export class StoreRegistrationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.1:8080/api/payflow/store';

  registerStore(payload: StoreRegistrationPayload): Observable<unknown> {
    return this.http.post(this.apiUrl, payload);
  }
}
