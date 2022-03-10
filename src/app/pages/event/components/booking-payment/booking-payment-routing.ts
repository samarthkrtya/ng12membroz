import { Routes, RouterModule } from '@angular/router';
import { BookingPaymentComponent } from './booking-payment.component';
const routes: Routes = [

  { path: '', component: BookingPaymentComponent },
  { path: ':id', component: BookingPaymentComponent },
  { path: ':id/:pid', component: BookingPaymentComponent }
];
export const routing = RouterModule.forChild(routes);