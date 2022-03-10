import { Routes, RouterModule } from '@angular/router';
import { AdminBookingComponent } from './admin-booking.component';

export const AdminBookingRoutes: Routes = [
  {
    path: '', component: AdminBookingComponent,
    children: [
         { path: 'season-calendar', loadChildren: () => import('./components/season-calendar/season-calendar.module').then(m => m.SeasonCalendarModule)},
    
        ],
  },
];


