import { Routes, RouterModule } from '@angular/router';
import { PropertyCalendarViewComponent } from './property-calendar-view.component';

 
const routes: Routes = [
  { path: '', component: PropertyCalendarViewComponent },
  { path: ':id', component: PropertyCalendarViewComponent },
];

export const routing = RouterModule.forChild(routes);
