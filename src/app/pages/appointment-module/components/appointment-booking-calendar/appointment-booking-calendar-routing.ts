import { Routes, RouterModule } from '@angular/router';
import { AppointmentBookingCalendarComponent } from './appointment-booking-calendar.component';

const routes: Routes = [
  { path: '', component: AppointmentBookingCalendarComponent },
  { path: ':id', component: AppointmentBookingCalendarComponent },
];
export const routing = RouterModule.forChild(routes);