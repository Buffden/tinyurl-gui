import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { UrlShortenerService, ShortenResponse } from '../../services/url-shortener.service';

@Component({
  selector: 'app-hero',
  imports: [CommonModule, MatTabsModule, MatExpansionModule, FormsModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  copyToClipboard(text: string | null) {
    if (typeof text === 'string' && navigator && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  shareUrl(url: string | null) {
    if (typeof url === 'string' && navigator.share) {
      navigator.share({ url });
    } else if (typeof url === 'string') {
      this.copyToClipboard(url);
    }
  }

  visitUrl(url: string | null) {
    if (typeof url === 'string') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
  longUrl = '';
  expiresInDays: number | null = null;
  loading = false;
  error: string | null = null;
  shortUrl: string | null = null;

  constructor(private urlShortener: UrlShortenerService) { }

  onShorten() {
    this.error = null;
    this.shortUrl = null;
    if (!this.longUrl.trim()) {
      this.error = 'Please enter a valid URL.';
      return;
    }
    this.loading = true;
    const req = {
      url: this.longUrl.trim(),
      ...(this.expiresInDays ? { expiresInDays: this.expiresInDays } : {})
    };
    this.urlShortener.shortenUrl(req).subscribe({
      next: (res: ShortenResponse) => {
        this.shortUrl = res.shortUrl;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to shorten URL.';
        this.loading = false;
      }
    });
  }
}
