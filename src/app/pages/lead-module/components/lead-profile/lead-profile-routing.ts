import { Routes, RouterModule } from '@angular/router';
import { LeadProfileComponent } from './lead-profile.component';

const routes: Routes = [
  { path: '', component: LeadProfileComponent },
  { path: ':id', component: LeadProfileComponent },
  { path: ':id/:formid', component: LeadProfileComponent },
];
export const routing = RouterModule.forChild(routes);