import { Routes, RouterModule } from '@angular/router';
import { LeavePolicyComponent } from './leave-policy.component';


const routes: Routes = [
  { path: '', component: LeavePolicyComponent },
  { path: ':id', component: LeavePolicyComponent },
];

export const routing = RouterModule.forChild(routes);
