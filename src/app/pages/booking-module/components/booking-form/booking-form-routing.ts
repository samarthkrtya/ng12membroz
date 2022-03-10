import { Routes, RouterModule } from '@angular/router';
import { BookingFormComponent } from './booking-form.component';


const routes: Routes = [
  { path: '', component: BookingFormComponent },
  { path: ':id', component: BookingFormComponent },
  { path: ':customer/:cid', component: BookingFormComponent },

];

export const routing = RouterModule.forChild(routes);
