import { Routes, RouterModule } from '@angular/router';
import { AppointmentViewComponent } from './appointment-view.component';


const routes: Routes = [ 
  { path: ':id', component: AppointmentViewComponent }
];

export const routing = RouterModule.forChild(routes);
