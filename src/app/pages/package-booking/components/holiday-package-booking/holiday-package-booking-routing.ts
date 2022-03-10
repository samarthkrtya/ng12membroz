import { Routes, RouterModule } from '@angular/router';
import { HolidayPackageBookingComponent } from './holiday-package-booking.component';
const routes: Routes = [

  { path: '', component: HolidayPackageBookingComponent },
  { path: ':id', component: HolidayPackageBookingComponent },
  { path: 'package/:pid/:cid', component: HolidayPackageBookingComponent },
];
export const routing = RouterModule.forChild(routes);