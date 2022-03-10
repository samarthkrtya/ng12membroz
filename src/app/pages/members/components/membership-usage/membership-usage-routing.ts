import { Routes, RouterModule } from '@angular/router';
import { MembershipUsageComponent } from './membership-usage.component';

const routes: Routes = [
  { path: '', component: MembershipUsageComponent },
  { path: ':id', component: MembershipUsageComponent },
];
export const routing = RouterModule.forChild(routes);