import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppointmentModuleComponent } from './appointment-module.component';

export const AppointmentModuleRoutes: Routes = [
  {
    path: '', component: AppointmentModuleComponent,
    children: [
      {
        path: 'booking-calendar',
        loadChildren: () => import('./components/appointment-booking-calendar/appointment-booking-calendar.module').then(m => m.AppointmentBookingCalendarModule),
      },
      {
        path: 'frontdesk',
        loadChildren: () => import('./components/appointment-frontdesk/appointment-frontdesk.module').then(m => m.AppointmentFrontdeskModule),
      },
      {
        path: 'appointmentbookingform',
        loadChildren: () => import('./components/appointment-booking-form/appointment-booking-form.module').then(m => m.AppointmentBookingFormModule),
      },
      {
        path: 'appointment-view',
        loadChildren: () => import('./components/appointment-view/appointment-view.module').then(m => m.AppointmentViewModule),
      },
      {
        path: 'staff-calendar',
        loadChildren: () => import('./components/appointment-staff-usage/staff-usage-view.module').then(m => m.StaffUsageViewModule),
      },
    ],
  },
];