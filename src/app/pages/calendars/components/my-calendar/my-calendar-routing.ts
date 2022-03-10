import { Routes, RouterModule } from '@angular/router';
import { MyCalendarComponent } from './my-calendar.component';

 
const routes: Routes = [
  { path: '', component: MyCalendarComponent },
  { path: ':id', component: MyCalendarComponent },
];

export const routing = RouterModule.forChild(routes);
