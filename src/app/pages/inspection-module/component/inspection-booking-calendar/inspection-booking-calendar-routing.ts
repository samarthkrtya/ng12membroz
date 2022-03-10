import { RouterModule, Routes } from '@angular/router';
import { InspectionBookingCalendarComponent } from './inspection-booking-calendar.component';

export const Route: Routes = [
  { path: '', component: InspectionBookingCalendarComponent },
  { path: ':id', component: InspectionBookingCalendarComponent }
];

export const routing = RouterModule.forChild(Route);