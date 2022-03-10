import { Routes } from '@angular/router';
import { CalendarsComponent } from './calendars.component';

export const CalendarRoutes: Routes = [
  {
    path: '', component: CalendarsComponent,
    children: [
      {
        path: 'my-calendar',
        loadChildren: () => import('./components/my-calendar/my-calendar.module').then(m => m.MyCalendarModule),
      },
      {
        path: 'holiday-calendar',
        loadChildren: () => import('./components/holiday-calendar/holiday-calendar.module').then(m => m.HolidayCalendarModule),
      },
      {
        path: 'event-calendar',
        loadChildren: () => import('./components/event-calendar/event-calendar.module').then(m => m.EventCalendarModule),
      },
      {
        path: 'attendance-calendar',
        loadChildren: () => import('./components/attendance-calendar/attendance-calendar.module').then(m => m.AttendanceCalendarModule),
      },

    ]
  }
];