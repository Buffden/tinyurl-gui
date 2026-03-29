import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-features',
  imports: [CommonModule],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(24px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('900ms cubic-bezier(0.16, 1, 0.3, 1)'))
    ])
  ]
})
export class FeaturesComponent implements OnInit {
  animState: 'hidden' | 'visible' = 'hidden';

  features = [
    {
      icon: 'bolt',
      title: 'Lightning Fast Redirects',
      description: 'Short links typically resolve in under 50ms. Built on AWS with Cloudflare in front — your audience never waits.',
      color: 'purple'
    },
    {
      icon: 'lock',
      title: 'Secure by Default',
      description: 'All traffic is HTTPS end-to-end. Your URLs are stored in an encrypted PostgreSQL database inside a private AWS VPC.',
      color: 'green'
    },
    {
      icon: 'qr_code',
      title: 'QR Code Generator',
      description: 'Generate a scannable QR code for any URL. Download as PNG or SVG — ready for print, presentations, or digital use.',
      color: 'blue'
    },
    {
      icon: 'schedule',
      title: 'Custom Expiry Dates',
      description: 'Set links to expire anywhere from 1 day to 3,650 days (~10 years). Expired links return a clean 404 so your audience never hits a stale redirect.',
      color: 'purple'
    },
    {
      icon: 'person_off',
      title: 'No Account Required',
      description: 'Shorten URLs and generate QR codes instantly — no sign-up, no login, no friction. Just paste and go.',
      color: 'green'
    },
    {
      icon: 'price_check',
      title: 'Completely Free',
      description: 'No plans, no paywalls, no usage caps for normal use. Up to 40 URL creations per minute per IP for fair access.',
      color: 'blue'
    }
  ];

  ngOnInit(): void {
    setTimeout(() => { this.animState = 'visible'; }, 600);
  }
}
