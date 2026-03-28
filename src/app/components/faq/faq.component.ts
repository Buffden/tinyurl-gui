import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, transition, style, animate } from '@angular/animations';

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(28px)', filter: 'blur(6px)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' })),
      transition('hidden => visible', animate('1500ms cubic-bezier(0.16, 1, 0.3, 1)'))
    ])
  ]
})
export class FaqComponent implements OnInit {
  animState: 'hidden' | 'visible' = 'hidden';

  ngOnInit(): void {
    setTimeout(() => { this.animState = 'visible'; }, 1800);
  }
  items: FaqItem[] = [
    {
      question: 'What is a short URL and how does it work?',
      answer: 'A short URL is a compact alias that redirects to your original long link. When someone clicks it, our server instantly looks up the destination and forwards them — typically in under 50ms. It makes links easier to share, especially on platforms with character limits.',
      open: false
    },
    {
      question: 'How long do shortened URLs stay active?',
      answer: 'By default, links expire after 180 days from the date of creation. You can set a custom expiry when shortening — anywhere from 1 day to several months. Once expired, the short code returns a 404 and can no longer be used.',
      open: false
    },
    {
      question: 'Can I set a custom expiry for my link?',
      answer: 'Yes. In the "Shorten a Link" tab, enter a number in the "Expires in (days)" field before clicking Shorten. Leave it blank to use the default 180-day expiry. Links with a custom expiry are marked internally so they behave exactly as configured.',
      open: false
    },
    {
      question: 'What is the QR Code generator?',
      answer: 'The QR Code tab generates a scannable code for any URL you provide. It also shortens the URL behind the scenes, so the QR code points to a compact short link rather than the full original URL. You can download the result as a PNG image or an SVG vector file.',
      open: false
    },
    {
      question: 'Is there a limit to how many URLs I can shorten?',
      answer: 'There is a rate limit of 40 URL creations per minute per IP address to ensure fair use and protect the service. For normal personal or small-team use you will never hit this ceiling. If you need higher throughput, reach out directly.',
      open: false
    },
    {
      question: 'Can I track how many times my short link was clicked?',
      answer: 'Click analytics are on the roadmap. The current version does not yet expose click counts in the UI, though the infrastructure is being designed to support it. Check back for updates — it will be added in a future release.',
      open: false
    },
    {
      question: 'Is my data safe? What happens to the original URL I paste?',
      answer: 'Your URLs are stored in an encrypted-at-rest PostgreSQL database on AWS RDS, inside a private VPC subnet that is not publicly reachable. Traffic is protected by HTTPS end-to-end and passes through Cloudflare before reaching the server. We do not sell or share your data.',
      open: false
    },
    {
      question: 'Can I use short links for commercial purposes?',
      answer: 'Yes, for reasonable personal and small-business use. You may not use this service to shorten links that distribute malware, facilitate phishing, violate intellectual property rights, or break any applicable law. Such links will be removed without notice.',
      open: false
    }
  ];

  toggle(item: FaqItem): void {
    const wasOpen = item.open;
    this.items.forEach(i => i.open = false);
    item.open = !wasOpen;
  }
}
