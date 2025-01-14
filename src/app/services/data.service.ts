import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValueResponse } from '../models/models';
@Injectable({
  providedIn: 'root',
})
export class DataService {
  private baseUrl = `${environment.baseUrl}/api/v1/retrieve`;
  constructor(private http: HttpClient) {}

  getDatas(from: Date, to: Date): Observable<ValueResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'BigProfiles-API',
      'X-API-KEY': 'BigProfiles-API',
    });
    const params = new HttpParams()
      .append('date_from', from.toISOString())
      .append('date_to', to.toISOString());
    return this.http.get<ValueResponse>(this.baseUrl, { headers, params });
  }
}
