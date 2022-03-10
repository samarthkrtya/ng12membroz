import { Routes, RouterModule } from '@angular/router';
import { FacilityDailyBookingFormComponent } from './facility-dailybooking-form.component';


const routes: Routes = [
  { path: '', component: FacilityDailyBookingFormComponent },
  { path: ':id', component: FacilityDailyBookingFormComponent },
  { path: ':customer/:cid', component: FacilityDailyBookingFormComponent },
];

export const routing = RouterModule.forChild(routes);
