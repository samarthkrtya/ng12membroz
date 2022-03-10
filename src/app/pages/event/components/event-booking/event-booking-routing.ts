import { Routes, RouterModule } from '@angular/router';
import { EventBookingComponent } from './event-booking.component';
const routes: Routes = [

  { path: '', component: EventBookingComponent },
  { path: ':id', component: EventBookingComponent }
];
export const routing = RouterModule.forChild(routes);