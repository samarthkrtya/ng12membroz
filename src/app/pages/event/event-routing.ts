import { Routes } from '@angular/router';
import { EventComponent } from './event.component';

export const PaymentModuleRoutes: Routes = [
  {
    path: '', component: EventComponent,
    children: [
      {
        path: 'make-event',
        loadChildren: () => import('./components/make-event/make-event.module').then(m => m.MakeEventModule),
      },
      {
        path: 'event-booking',
        loadChildren: () => import('./components/event-booking/event-booking.module').then(m => m.EventBookingModule),
      },
      {
        path: 'booking-payment',
        loadChildren: () => import('./components/booking-payment/booking-payment.module').then(m => m.BookingPaymentModule),
      },
      {
        path: 'event-view',
        loadChildren: () => import('./components/event-view/event-view.module').then(m => m.EventViewModule),
       }
      ]
  }
];