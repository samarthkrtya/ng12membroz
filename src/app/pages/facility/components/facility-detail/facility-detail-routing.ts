import { Routes, RouterModule } from '@angular/router';
import { FacilityDetailComponent } from './facility-detail.component';

const routes: Routes = [
  { path: '', component: FacilityDetailComponent },
  { path: ':id', component: FacilityDetailComponent },
  { path: ':id/:formid', component: FacilityDetailComponent },
];
export const routing = RouterModule.forChild(routes);