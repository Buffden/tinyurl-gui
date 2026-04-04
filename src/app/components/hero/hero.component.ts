import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { QRCodeComponent } from 'angularx-qrcode';
import { UrlShortenerService, ShortenResponse } from '../../services/url-shortener.service';
import { SleepService } from '../../services/sleep.service';
import { trigger, state, transition, style, animate } from '@angular/animations';

const revealLine = (delay: number) =>
  trigger(`revealLine${delay}`, [
    state('hidden', style({ opacity: 0, transform: 'translateY(28px)', filter: 'blur(6px)' })),
    state('visible', style({ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' })),
    transition('hidden => visible', animate(`1500ms ${delay}ms cubic-bezier(0.16, 1, 0.3, 1)`))
  ]);

const fadeIn = (delay: number) =>
  trigger(`fadeIn${delay}`, [
    state('hidden', style({ opacity: 0 })),
    state('visible', style({ opacity: 1 })),
    transition('hidden => visible', animate(`700ms ${delay}ms ease-in-out`))
  ]);

@Component({
  selector: 'app-hero',
  imports: [CommonModule, MatTabsModule, MatExpansionModule, FormsModule, QRCodeComponent],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  animations: [revealLine(0), revealLine(250), revealLine(500), fadeIn(900), fadeIn(1100)]
})
export class HeroComponent implements OnInit {
  showScrollIndicator = true;
  animState: 'hidden' | 'visible' = 'hidden';

  ngOnInit(): void {
    setTimeout(() => { this.animState = 'visible'; });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.showScrollIndicator = window.scrollY < window.innerHeight * 0.8;
  }

  // Shorten tab state
  longUrl = '';
  expiresInDays: number | null = null;
  expiryDate: string = '';
  readonly minDate: string = this.toDateString(1);
  readonly maxDate: string = this.toDateString(3650);
  loading = false;
  error: string | null = null;
  shortUrl: string | null = null;

  // QR tab state
  qrUrl = '';
  qrGenerated: string | null = null;
  qrShortUrl: string | null = null;
  qrLoading = false;
  qrError: string | null = null;

  constructor(
    private urlShortener: UrlShortenerService,
    readonly sleep: SleepService
  ) {}

  onShorten() {
    this.error = null;
    if (this.shortUrl) {
      this.shortUrl = null;
      this.qrGenerated = null;
      this.longUrl = '';
      this.expiresInDays = null;
      return;
    }
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
        this.qrGenerated = res.shortUrl;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to shorten URL.';
        this.loading = false;
      }
    });
  }

  onGenerateQr() {
    this.qrError = null;
    this.qrGenerated = null;
    this.qrShortUrl = null;
    if (!this.qrUrl.trim()) {
      this.qrError = 'Please enter a valid URL.';
      return;
    }
    this.qrGenerated = this.qrUrl.trim();
    this.qrLoading = true;
    this.urlShortener.shortenUrl({ url: this.qrUrl.trim() }).subscribe({
      next: (res: ShortenResponse) => {
        this.qrShortUrl = res.shortUrl;
        this.shortUrl = res.shortUrl;
        this.longUrl = this.qrUrl.trim();
        this.qrLoading = false;
      },
      error: () => {
        this.qrLoading = false;
      }
    });
  }

  downloadPng() {
    const canvas = document.querySelector('.qr-canvas-wrap canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  downloadSvg() {
    const svg = document.querySelector('.qr-svg-wrap svg') as SVGElement;
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = 'qrcode.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  copyToClipboard(text: string | null) {
    if (typeof text === 'string' && navigator?.clipboard) {
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

  onExpiryDateChange(value: string): void {
    if (!value) {
      this.expiresInDays = null;
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(value);
    const diff = Math.round((selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    this.expiresInDays = diff > 0 ? diff : null;
  }

  openDatePicker(): void {
    const input = document.getElementById('expires-in-days') as HTMLInputElement;
    input?.showPicker?.();
  }

  private toDateString(daysFromNow: number): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().split('T')[0];
  }
}
