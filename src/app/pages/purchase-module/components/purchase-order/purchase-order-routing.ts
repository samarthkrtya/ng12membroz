import { Routes, RouterModule } from '@angular/router';
import { PurchaseOrderComponent } from './purchase-order.component';

 
const routes: Routes = [
  { path: '', component: PurchaseOrderComponent },
  { path: ':id', component: PurchaseOrderComponent },
  { path: ':formid/:id', component: PurchaseOrderComponent }
];

export const routing = RouterModule.forChild(routes);
