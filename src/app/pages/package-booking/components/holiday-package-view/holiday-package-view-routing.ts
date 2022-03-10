import { Routes, RouterModule } from '@angular/router';
import { HolidayPackageViewComponent } from './holiday-package-view.component';

const routes: Routes = [
  { path: '', component: HolidayPackageViewComponent },
  { path: ':id', component: HolidayPackageViewComponent }
];
export const routing = RouterModule.forChild(routes);