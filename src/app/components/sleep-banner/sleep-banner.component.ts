import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SleepService } from '../../services/sleep.service';

@Component({
  selector: 'app-sleep-banner',
  imports: [CommonModule],
  templateUrl: './sleep-banner.component.html',
  styleUrl: './sleep-banner.component.scss'
})
export class SleepBannerComponent implements OnInit {
  visible = false;

  constructor(private sleep: SleepService) {}

  ngOnInit(): void {
    if (sessionStorage.getItem('sleep-banner-dismissed')) return;
    this.visible = this.sleep.isAsleep;
  }

  dismiss(): void {
    this.visible = false;
    sessionStorage.setItem('sleep-banner-dismissed', '1');
  }
}
