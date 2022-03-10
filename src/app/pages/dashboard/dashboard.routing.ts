import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

export const DashboardRoutes: Routes = [
    { path: '',component: DashboardComponent,
    children: [
        { 
           path: 'profile', 
          loadChildren: () => import('./components/dashboard-detail/dashboard-detail.module').then(m => m.DashboardModule), 
        },       
      ],
},
];
