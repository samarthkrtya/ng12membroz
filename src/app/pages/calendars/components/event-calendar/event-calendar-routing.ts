import { Routes, RouterModule } from '@angular/router';
import { EventCalendarComponent } from './event-calendar.component';

 
const routes: Routes = [
  { path: '', component: EventCalendarComponent },
  { path: ':id', component: EventCalendarComponent },
];

export const routing = RouterModule.forChild(routes);
