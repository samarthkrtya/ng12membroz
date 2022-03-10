import { Routes } from '@angular/router';
import { PropertyModuleComponent } from './property-module.component';

export const PropertyModuleRoutes: Routes = [
  {
    path: '', component: PropertyModuleComponent,
    children: [
      {
        path: 'calendar',
        loadChildren: () => import('./components/property-calendar-view/property-calendar-view.module').then(m => m.PropertyCalendarViewModule),
      }
    ]
  }
];