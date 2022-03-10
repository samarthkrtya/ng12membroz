import { Routes, RouterModule } from '@angular/router';
import { VehicleProfileComponent } from './vehicle-profile.component';

const routes: Routes = [
  { path: '', component: VehicleProfileComponent },
  { path: ':id', component: VehicleProfileComponent },
  { path: ':id/:formid', component: VehicleProfileComponent },
];
export const routing = RouterModule.forChild(routes);