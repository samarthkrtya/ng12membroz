import { Routes, RouterModule } from '@angular/router';
import { OpeningBalancesComponent } from './opening-balances.component';

const routes: Routes = [
  { path: '', component: OpeningBalancesComponent },
];

export const routing = RouterModule.forChild(routes);



