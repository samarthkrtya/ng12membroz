import { Routes, RouterModule } from '@angular/router';
import { AppointmentBookingFormComponent } from './appointment-booking-form.component';


const routes: Routes = [
  { path: '', component: AppointmentBookingFormComponent },
  { path: ':id', component: AppointmentBookingFormComponent },
  { path: ':customer/:cid', component: AppointmentBookingFormComponent },
];

export const routing = RouterModule.forChild(routes);
