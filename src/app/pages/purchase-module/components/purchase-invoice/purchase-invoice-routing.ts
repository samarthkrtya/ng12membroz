import { Routes, RouterModule } from '@angular/router';
import { PurchaseInvoiceComponent } from './purchase-invoice.component';

 
const routes: Routes = [
  { path: '', component: PurchaseInvoiceComponent },
  { path: ':id', component: PurchaseInvoiceComponent },
  { path: ':formid/:id', component: PurchaseInvoiceComponent }
];

export const routing = RouterModule.forChild(routes);
