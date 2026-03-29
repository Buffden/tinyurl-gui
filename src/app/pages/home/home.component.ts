import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { HeroComponent } from "../../components/hero/hero.component";
import { FaqComponent } from "../../components/faq/faq.component";
import { HowItWorksComponent } from "../../components/how-it-works/how-it-works.component";
import { FeaturesComponent } from "../../components/features/features.component";

@Component({
  selector: 'app-home',
  imports: [HeroComponent, FaqComponent, HowItWorksComponent, FeaturesComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  constructor(private title: Title, private meta: Meta) { }

  ngOnInit(): void {
    this.title.setTitle('TinyURL — Free URL Shortener & QR Code Generator');

    this.meta.updateTag({ name: 'description', content: 'Shorten long URLs instantly and generate QR codes for free. Fast, secure, and built on AWS. Transform any link into a clean, shareable short URL in seconds.' });
    this.meta.updateTag({ property: 'og:title', content: 'TinyURL — Free URL Shortener & QR Code Generator' });
    this.meta.updateTag({ property: 'og:description', content: 'Shorten long URLs instantly and generate QR codes for free. Fast, secure, and built on AWS.' });
    this.meta.updateTag({ property: 'og:url', content: 'https://tinyurl.buffden.com/' });
    this.meta.updateTag({ name: 'twitter:title', content: 'TinyURL — Free URL Shortener & QR Code Generator' });
    this.meta.updateTag({ name: 'twitter:description', content: 'Shorten long URLs instantly and generate QR codes for free. Fast, secure, and built on AWS.' });
    this.meta.updateTag({ property: 'og:image', content: 'https://tinyurl.buffden.com/og-image.png' });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://tinyurl.buffden.com/og-image.png' });
  }
}
