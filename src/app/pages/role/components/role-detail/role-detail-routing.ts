import { Routes, RouterModule } from '@angular/router';
import { RoleDetailComponent } from './role-detail.component';

const routes: Routes = [
  { path: '', component: RoleDetailComponent },
  { path: ':id', component: RoleDetailComponent },
];
export const routing = RouterModule.forChild(routes);