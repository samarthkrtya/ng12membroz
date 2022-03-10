import { Routes, RouterModule } from '@angular/router';
import { SeasonCalendarComponent } from './season-calendar.component';
import { SeasonCalendarViewComponent } from './season-calendarView/season-calendarView.component';

const routes: Routes = [
  {
    path: '', component: SeasonCalendarComponent,
    children: [
      { path: '', component: SeasonCalendarViewComponent },
    ],
  },
];

export const routing = RouterModule.forChild(routes);
