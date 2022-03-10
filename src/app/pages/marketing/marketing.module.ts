import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MarketingRoutes } from './marketing-routing';
import { MarketingComponent } from './marketing.component';

@NgModule({
  imports: [ 
    RouterModule.forChild(MarketingRoutes),
  ],
  declarations: [
    MarketingComponent
  ]
})
export class MarketingModule { }
