import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SleepService {
  readonly isAsleep: boolean = this.checkSleep();

  private checkSleep(): boolean {
    const now = new Date();
    // Resolve current time in America/Chicago (handles DST automatically)
    const chicago = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const hour = chicago.getHours();
    const day = chicago.getDay(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6 || hour >= 23 || hour < 7;
  }
}
