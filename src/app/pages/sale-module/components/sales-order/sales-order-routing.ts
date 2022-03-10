import { Routes, RouterModule } from '@angular/router';
import { SalesOrderComponent } from './sales-order.component';

const routes: Routes = [
  { path: '', component: SalesOrderComponent },
  { path: ':type', component: SalesOrderComponent }, // Facility
  { path: ':type/:id', component: SalesOrderComponent }, // Product/123
];
export const routing = RouterModule.forChild(routes);