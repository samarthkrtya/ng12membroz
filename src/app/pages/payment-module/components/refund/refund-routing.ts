import { Routes, RouterModule } from '@angular/router';
import { RefundComponent } from './refund.component';

const routes: Routes = [
  { path: '', component: RefundComponent },     // customer, membership-refund
  { path: ':formname', component: RefundComponent }, // customer, membership-refund
  { path: ':formname/:id', component: RefundComponent }, // customer, membership-refund
  { path: 'mode/:formname/:customerid', component: RefundComponent }, // customer, membership-refund / customerid
  { path: 'mode/:formname/:customerid/:invoiceid', component: RefundComponent }, // customer, membership-refund /:customerid/:invoiceid
];
export const routing = RouterModule.forChild(routes);