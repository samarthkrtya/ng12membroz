import { Routes } from '@angular/router';
import { BookingModuleComponent } from './booking-module.component';

export const BookingModuleRoutes: Routes = [
  {
    path: '', component: BookingModuleComponent,
    children: [
      {
        path: 'form',
        loadChildren: () => import('./components/booking-form/booking-form.module').then(m => m.BookingFormModule),
      },
      {
        path: 'booking-view',
        loadChildren: () => import('./components/booking-view/booking-view.module').then(m => m.BookingViewModule),
      }
    ]
  }
];