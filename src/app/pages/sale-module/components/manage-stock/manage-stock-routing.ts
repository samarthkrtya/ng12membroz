import { RouterModule, Routes } from '@angular/router';

import { ManageStockComponent } from './manage-stock.component';
 
const routes: Routes = [
  { path: '', component: ManageStockComponent },
  { path: ':formid', component: ManageStockComponent }
];

export const routing = RouterModule.forChild(routes);