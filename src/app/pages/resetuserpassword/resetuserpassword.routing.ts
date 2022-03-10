import { Routes, RouterModule } from '@angular/router';
import { ResetuserpasswordComponent } from './resetuserpassword.component';

const routes: Routes = [
  { path: '', component: ResetuserpasswordComponent },
  { path: ':id/:type', component: ResetuserpasswordComponent },
];

export const routing = RouterModule.forChild(routes);

