import { Routes, RouterModule } from '@angular/router';
import { ChallanComponent } from './challan.component';

 
const routes: Routes = [
  { path: '', component: ChallanComponent },
  { path: ':id', component: ChallanComponent },
  { path: ':formid/:id', component: ChallanComponent }
];

export const routing = RouterModule.forChild(routes);
