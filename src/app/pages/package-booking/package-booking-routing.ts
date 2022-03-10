import { Routes } from '@angular/router';
import { PackageBookingComponent } from './package-booking.component';

export const PaymentModuleRoutes: Routes = [
  {
    path: '', component: PackageBookingComponent,
    children: [
      {
        path: 'holiday-package',
        loadChildren: () => import('./components/holiday-package/holiday-package.module').then(m => m.HolidayPackageModule),
      }, 
      {
        path: 'holiday-package-view',
        loadChildren: () => import('./components/holiday-package-view/holiday-package-view.module').then(m => m.HolidayPackageViewModule),
      },
      {
        path: 'holiday-package-booking',
        loadChildren: () => import('./components/holiday-package-booking/holiday-package-booking.module').then(m => m.HolidayPackageBookingModule),
      }, 
      {
        path: 'holiday-package-frontdesk',
        loadChildren: () => import('./components/holiday-package-frontdesk/holiday-package-frontdesk.module').then(m => m.HolidayPackageFrontdeskModule),
      },
      {
        path: 'resort-view',
        loadChildren: () => import('./components/resort-view/resort-view.module').then(m => m.ResortViewModule),
      },
      {
        path: 'package-itinerary',
        loadChildren: () => import('./components/package-itinerary/package-itinerary.module').then(m => m.PackageItineraryModule),
      },
      {
        path: 'schedule-package',
        loadChildren: () => import('./components/schedule-package/schedule-package.module').then(m => m.SchedulePackageModule),
      },
    ]
  }
];