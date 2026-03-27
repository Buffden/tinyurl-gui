import { Component } from '@angular/core';
import { HeroComponent } from "../../components/hero/hero.component";
import { FaqComponent } from "../../components/faq/faq.component";

@Component({
  selector: 'app-home',
  imports: [HeroComponent, FaqComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
