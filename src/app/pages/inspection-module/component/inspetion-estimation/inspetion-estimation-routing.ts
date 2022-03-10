import { Routes, RouterModule } from '@angular/router';
import { InspetionEstimationComponent } from './inspetion-estimation.component';

const routes: Routes = [
  { path: '', component: InspetionEstimationComponent },
  { path: ':id', component: InspetionEstimationComponent },
];
export const routing = RouterModule.forChild(routes);