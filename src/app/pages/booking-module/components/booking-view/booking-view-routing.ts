import { Routes, RouterModule } from '@angular/router';
import { BookingViewComponent } from './booking-view.component';


const routes: Routes = [
  { path: '', component: BookingViewComponent },
  { path: ':id', component: BookingViewComponent },
];

export const routing = RouterModule.forChild(routes);
