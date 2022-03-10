import { Routes, RouterModule } from '@angular/router';
import { MemberProfileComponent } from './member-profile.component';

const routes: Routes = [
  { path: '', component: MemberProfileComponent },
  { path: ':id', component: MemberProfileComponent },
  { path: ':id/:formid', component: MemberProfileComponent },
];
export const routing = RouterModule.forChild(routes);