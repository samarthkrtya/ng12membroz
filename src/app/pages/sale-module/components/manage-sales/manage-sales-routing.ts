import { RouterModule, Routes } from '@angular/router';

import { ManageSalesComponent } from './manage-sales.component';
 
const routes: Routes = [
  { path: '', component: ManageSalesComponent },
  { path: ':id', component: ManageSalesComponent },
  { path: ':id/:billpayid', component: ManageSalesComponent },
];

export const routing = RouterModule.forChild(routes);