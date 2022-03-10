import { Routes, RouterModule } from '@angular/router';
import { SalesEstimateComponent } from './sales-estimate.component';

const routes: Routes = [
  { path: '', component: SalesEstimateComponent },
  { path: ':type', component: SalesEstimateComponent }, // Facility
  { path: ':type/:id', component: SalesEstimateComponent }, // Product/123
];
export const routing = RouterModule.forChild(routes);