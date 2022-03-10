import { Routes, RouterModule } from '@angular/router';
import { CustomerProfileComponent } from './customer-profile.component';

const routes: Routes = [
  { path: '', component: CustomerProfileComponent },
  { path: ':id', component: CustomerProfileComponent },
  { path: ':id/:formid', component: CustomerProfileComponent },
];
export const routing = RouterModule.forChild(routes);