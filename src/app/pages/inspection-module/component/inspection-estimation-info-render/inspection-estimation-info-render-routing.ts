import { Routes, RouterModule } from '@angular/router';
import { InspectionEstimationInfoRenderComponent } from './inspection-estimation-info-render.component';

const routes: Routes = [
  { path: '', component: InspectionEstimationInfoRenderComponent },
  { path: ':id', component: InspectionEstimationInfoRenderComponent },
  { path: ':customer/:cid', component: InspectionEstimationInfoRenderComponent },
];
export const routing = RouterModule.forChild(routes);