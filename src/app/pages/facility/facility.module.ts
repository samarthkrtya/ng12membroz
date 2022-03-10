import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FacilityRoutes } from './facility-routing';
import { FacilityComponent } from './facility.component';
import { FacilityDetailComponent } from './components/facility-detail/facility-detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(FacilityRoutes),
  ],
  declarations: [
    FacilityComponent,
  ],
})
export class FacilityModule { }