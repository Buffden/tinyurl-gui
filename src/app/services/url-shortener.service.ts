import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShortenResponse {
  shortUrl: string;
}

@Injectable({ providedIn: 'root' })
export class UrlShortenerService {
  constructor(private http: HttpClient) {}

  shortenUrl(data: { url: string; expiresInDays?: number }): Observable<ShortenResponse> {
    return this.http.post<ShortenResponse>('/api/urls', data);
  }
}
