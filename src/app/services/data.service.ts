import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  baseUrl = `${environment.baseUrl}/api/v1/retrieve`;
  constructor(private http: HttpClient) {}

  getDatas(from: Date, to: Date) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'BigProfiles-API',
      'X-API-KEY': 'BigProfiles-API',
    });
    const params = new HttpParams()
      .append('date_from', from.toISOString())
      .append('date_to', to.toISOString());

    this.http.get(this.baseUrl, { headers, params }).subscribe(
      (res) => {
        console.log('Dati ricevuti:', res);
      },
      (error) => {
        console.error('Errore:', error);
      }
    );
  }
}
