import { Routes, RouterModule } from '@angular/router';
import { MembershipDetailComponent } from './membership-detail.component';

const routes: Routes = [
  { path: ':formname/:id', component: MembershipDetailComponent },
];
export const routing = RouterModule.forChild(routes);