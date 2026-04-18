import { Component } from '@angular/core';
import { PricingContainerComponent } from './pricing/pricing-container/pricing-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PricingContainerComponent],
  template: `<app-pricing-container />`,
  styles: [`:host { display: block; }`],
})
export class App {}
