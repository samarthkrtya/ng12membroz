import { Routes, RouterModule } from '@angular/router';
import { StaffRoasterComponent } from './staff-roaster.component';

const routes: Routes = [
  { path: '', component: StaffRoasterComponent},
  { path: ':id', component: StaffRoasterComponent },
  
];
export const routing = RouterModule.forChild(routes);