import { Routes, RouterModule } from '@angular/router';
import { FacilityBookingFrontdeskComponent } from './facility-booking-frontdesk.component';

const routes: Routes = [
  { path: '', component: FacilityBookingFrontdeskComponent },
  { path: ':id', component: FacilityBookingFrontdeskComponent },
  { path: ':type/:id', component: FacilityBookingFrontdeskComponent }, // Product/123
  { path: 'view/bill/:billid', component: FacilityBookingFrontdeskComponent }, // view/bill/123
  { path: 'view/bill/:billid/:billpayid', component: FacilityBookingFrontdeskComponent }, // view/bill/123/123
];
export const routing = RouterModule.forChild(routes);