import { Routes, RouterModule } from '@angular/router';
import { LeaseFrontdeskComponent } from './lease-frontdesk.component';

const routes: Routes = [
  { path: '', component: LeaseFrontdeskComponent },
  { path: ':id', component: LeaseFrontdeskComponent },       // 123
  { path: 'view/bill/:billid', component: LeaseFrontdeskComponent }, // view/bill/123
  { path: 'view/bill/:type/:billid', component: LeaseFrontdeskComponent }, // view/bill/checkout/123
  { path: 'view/edit/:type/:billpayid', component: LeaseFrontdeskComponent }, // view/edit/checkout/123
];
export const routing = RouterModule.forChild(routes);