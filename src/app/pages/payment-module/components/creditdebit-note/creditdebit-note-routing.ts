import { Routes, RouterModule } from '@angular/router';
import { CreditdebitNoteComponent } from './creditdebit-note.component';

const routes: Routes = [
  { path: ':formname', component: CreditdebitNoteComponent }, // customer, membership-refund
  { path: ':formname/:id', component: CreditdebitNoteComponent }, // customer, membership-refund
  { path: 'mode/:formname/:customerid', component: CreditdebitNoteComponent }, // customer, membership-refund / customerid
  { path: 'mode/:formname/:customerid/:invoiceid', component: CreditdebitNoteComponent }, // customer, membership-refund /:customerid/:invoiceid
];
export const routing = RouterModule.forChild(routes);