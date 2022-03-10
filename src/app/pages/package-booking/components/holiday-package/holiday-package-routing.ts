import { Routes, RouterModule } from '@angular/router';
import { HolidayPackageComponent } from './holiday-package.component';
const routes: Routes = [

  { path: '', component: HolidayPackageComponent },
  { path: ':id', component: HolidayPackageComponent }
];
export const routing = RouterModule.forChild(routes);