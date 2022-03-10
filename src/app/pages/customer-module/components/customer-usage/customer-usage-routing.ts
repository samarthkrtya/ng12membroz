import { Routes, RouterModule } from '@angular/router';
import { CustomerUsageComponent } from './customer-usage.component';

const routes: Routes = [
  { path: '', component: CustomerUsageComponent },
  { path: ':id', component: CustomerUsageComponent },
];
export const routing = RouterModule.forChild(routes);