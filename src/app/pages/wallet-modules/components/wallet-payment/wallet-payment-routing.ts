import { Routes, RouterModule } from '@angular/router';
import { WalletPaymentComponent } from './wallet-payment.component';

const routes: Routes = [
  { path: '', component: WalletPaymentComponent },
  { path: ':id', component: WalletPaymentComponent }
];
export const routing = RouterModule.forChild(routes);