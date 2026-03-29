import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-how-it-works',
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
  styleUrl: './how-it-works.component.scss',
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(24px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('900ms cubic-bezier(0.16, 1, 0.3, 1)'))
    ])
  ]
})
export class HowItWorksComponent implements OnInit {
  animState: 'hidden' | 'visible' = 'hidden';

  steps = [
    {
      number: '01',
      icon: 'content_paste',
      title: 'Paste Your Long URL',
      description: 'Copy any long, messy URL — from a blog post, product page, social media link, or document — and paste it into the input field.'
    },
    {
      number: '02',
      icon: 'auto_awesome',
      title: 'Shorten It Instantly',
      description: 'Click Shorten and our server generates a clean 6-character short code in milliseconds. Optionally set a custom expiry date.'
    },
    {
      number: '03',
      icon: 'share',
      title: 'Share Anywhere',
      description: 'Copy your short link, share it directly, visit it, or download a QR code as PNG or SVG. Works on any platform, any device.'
    }
  ];

  ngOnInit(): void {
    setTimeout(() => { this.animState = 'visible'; }, 400);
  }
}
