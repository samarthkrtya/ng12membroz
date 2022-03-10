import { Routes } from '@angular/router';

import { FacilityBookingModuleComponent } from './facility-booking-module.component';

export const AppointmentModuleRoutes: Routes = [
  {
    path: '', component: FacilityBookingModuleComponent,
    children: [ 
      { 
        path: 'frontdesk', 
        loadChildren: () => import('./components/facility-booking-frontdesk/facility-booking-frontdesk.module').then(m => m.FacilityBookingFrontdeskModule),
      },
      { 
        path: 'facilitydailybooking', 
        loadChildren: () => import('./components/facility-dailybooking-form/facility-dailybooking-form.module').then(m => m.FacilityDailyBookingFormModule),
      },
      { 
        path: 'booking-calendar-test', 
        loadChildren: () => import('./components/facility-booking-calendar/facility-booking-calendar.module').then(m => m.FacilityBookingCalendarModule),
      },
      { 
        path: 'booking-calendar', 
        loadChildren: () => import('./components/facility-booking-calendar-copy/facility-booking-calendar-copy.module').then(m => m.FacilityBookingCalendarCopyModule),
      },
      
    ],
  },
];