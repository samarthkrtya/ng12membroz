import { Routes, RouterModule } from '@angular/router';
import { PurchaseRequestComponent } from './purchase-request.component';

 
const routes: Routes = [
  { path: '', component: PurchaseRequestComponent },
  { path: ':id', component: PurchaseRequestComponent },
  { path: ':formid/:id', component: PurchaseRequestComponent }
];

export const routing = RouterModule.forChild(routes);
