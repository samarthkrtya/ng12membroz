import { Routes, RouterModule } from '@angular/router';
import { MultiplePaymentComponent } from './multiple-payment.component';
const routes: Routes = [

  { path: '', component: MultiplePaymentComponent },
  { path: ':mid', component: MultiplePaymentComponent },
  { path: ':mid/:msid', component: MultiplePaymentComponent },
        
];
export const routing = RouterModule.forChild(routes);