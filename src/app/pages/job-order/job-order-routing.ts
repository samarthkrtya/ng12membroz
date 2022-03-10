import { Routes } from '@angular/router';
import { JobOrderComponent } from './job-order.component';

export const ModuleRoutes: Routes = [
  {
    path: '', component: JobOrderComponent,
    children: [
      {
        path: 'job-service',
        loadChildren: () => import('./components/service-form/service-form.module').then(m => m.ServiceFormModule),
      },
      {
        path: 'frontdesk',
        loadChildren: () => import('./components/job-order/job-order.module').then(m => m.JobOrderModule),
      },
      {
        path: 'joborder-info',
        loadChildren: () => import('./components/joborder-info-render/joborder-info-render.module').then(m => m.JoborderInfoRenderModule),
      },
    ]
  }
];