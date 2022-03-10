import { Routes, RouterModule } from '@angular/router';
import { JobOrderComponent } from './job-order.component';

const routes: Routes = [
  { path: '', component: JobOrderComponent },
  { path: ':id', component: JobOrderComponent },       // 123
  { path: ':type/:id', component: JobOrderComponent }, // Product/123
  { path: 'view/bill/:billid', component: JobOrderComponent }, // view/bill/123
  { path: 'view/bill/:billid/:billpayid', component: JobOrderComponent }, // view/bill/checkout/123/123

];
export const routing = RouterModule.forChild(routes);