import { Routes, RouterModule } from '@angular/router';
import { AppointmentFrontdeskComponent } from './appointment-frontdesk.component';

const routes: Routes = [
  { path: '', component: AppointmentFrontdeskComponent },
  { path: ':id', component: AppointmentFrontdeskComponent },       // 123
  { path: ':type/:id', component: AppointmentFrontdeskComponent }, // Product/123
  { path: 'view/bill/:billid', component: AppointmentFrontdeskComponent }, // view/bill/123
  { path: 'view/bill/:billid/:billpayid', component: AppointmentFrontdeskComponent }, // view/bill/checkout/123/123
  { path: 'appointment/package/:pkid', component: AppointmentFrontdeskComponent }, // appointment/package//123

];
export const routing = RouterModule.forChild(routes);