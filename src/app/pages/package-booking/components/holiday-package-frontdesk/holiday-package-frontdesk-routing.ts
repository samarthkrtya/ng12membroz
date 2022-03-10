import { Routes, RouterModule } from '@angular/router';
import { HolidayPackageFrontdeskComponent } from './holiday-package-frontdesk.component';

const routes: Routes = [
  { path: '', component: HolidayPackageFrontdeskComponent },
  { path: ':id', component: HolidayPackageFrontdeskComponent }
];
export const routing = RouterModule.forChild(routes);