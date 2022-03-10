import { Routes, RouterModule } from '@angular/router';
import { FacilityBookingCalendarCopyComponent } from './facility-booking-calendar-copy.component';

const routes: Routes = [
  { path: '', component: FacilityBookingCalendarCopyComponent },
  { path: ':id', component: FacilityBookingCalendarCopyComponent },
];
export const routing = RouterModule.forChild(routes);