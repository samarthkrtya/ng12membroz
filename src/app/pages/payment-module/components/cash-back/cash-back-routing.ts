import { Routes, RouterModule } from '@angular/router';
import { CashbackComponent } from './cash-back.component';

const routes: Routes = [
  { path: '', component: CashbackComponent },
  { path: ':id', component: CashbackComponent },
];
export const routing = RouterModule.forChild(routes);