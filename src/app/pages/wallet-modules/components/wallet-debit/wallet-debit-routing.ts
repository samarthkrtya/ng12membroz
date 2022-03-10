import { Routes, RouterModule } from '@angular/router';
import { WalletDebitComponent } from './wallet-debit.component';

const routes: Routes = [
  { path: '', component: WalletDebitComponent },
  { path: ':id', component: WalletDebitComponent }
];
export const routing = RouterModule.forChild(routes);