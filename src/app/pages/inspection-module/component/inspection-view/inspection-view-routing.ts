import { RouterModule, Routes } from '@angular/router';
import { InspectionViewComponent } from './inspection-view.component';

export const Route: Routes = [
  { path: '', component: InspectionViewComponent },
  { path: ':id', component: InspectionViewComponent }
];

export const routing = RouterModule.forChild(Route);