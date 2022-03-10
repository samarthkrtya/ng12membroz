import { Routes, RouterModule } from '@angular/router';
import { MakePaymentComponent } from './make-payment.component';
const routes: Routes = [
  { path: '', component: MakePaymentComponent },
  { path: ':id', component: MakePaymentComponent },
  { path: 'edit/:pid', component: MakePaymentComponent },
];
export const routing = RouterModule.forChild(routes);