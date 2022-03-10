import { Routes, RouterModule } from '@angular/router';
import { JobOrderComponent } from './job-order.component';

const routes: Routes = [
  { path: '', component: JobOrderComponent },
  { path: ':id', component: JobOrderComponent },       // 123
  { path: 'view/bill/:billid', component: JobOrderComponent }, // view/bill/123
  { path: 'view/bill/:type/:billid', component: JobOrderComponent }, // view/bill/checkout/123
  { path: 'view/edit/:type/:billpayid', component: JobOrderComponent }, // view/edit/checkout/123
];
export const routing = RouterModule.forChild(routes);