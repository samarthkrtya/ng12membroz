import { Routes, RouterModule } from '@angular/router';
import { MembersVisitorPunchComponent } from './members-visitor-punch.component';

const routes: Routes = [
  { path: '', component: MembersVisitorPunchComponent },
  { path: ':id', component: MembersVisitorPunchComponent },
];
export const routing = RouterModule.forChild(routes);