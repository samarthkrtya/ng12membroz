import { Routes, RouterModule } from '@angular/router';
import { UserDetailComponent } from './user-detail.component';

const routes: Routes = [
  { path: '', component: UserDetailComponent },
  { path: ':id', component: UserDetailComponent },
  { path: ':id/:formid', component: UserDetailComponent },
];
export const routing = RouterModule.forChild(routes);