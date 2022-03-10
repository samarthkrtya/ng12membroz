import { Routes, RouterModule } from '@angular/router';
import { InspectionPageComponent } from './inspection-page.component';

const routes: Routes = [
  { path: '', component: InspectionPageComponent },
  { path: ':id', component: InspectionPageComponent },
];
export const routing = RouterModule.forChild(routes);