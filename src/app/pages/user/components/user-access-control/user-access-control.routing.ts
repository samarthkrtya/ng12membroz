import { Routes, RouterModule } from '@angular/router';
import { UserAccessControlComponent } from './user-access-control.component';


const routes: Routes = [
  { path: '', component: UserAccessControlComponent },
  { path: ':id', component: UserAccessControlComponent },
];

export const routing = RouterModule.forChild(routes);
