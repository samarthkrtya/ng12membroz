import { Routes, RouterModule } from '@angular/router';
import { FacilityBookingCalendarComponent } from './facility-booking-calendar.component';

const routes: Routes = [
  { path: '', component: FacilityBookingCalendarComponent },
  { path: ':id', component: FacilityBookingCalendarComponent },
];
export const routing = RouterModule.forChild(routes);