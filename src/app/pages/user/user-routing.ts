import { Routes } from '@angular/router';
import { UserComponent } from './user.component';

export const UserRoutes: Routes = [
  {
    path: '', component: UserComponent,
    children: [
      { 
        path: 'profile', 
        loadChildren: () => import('./components/user-detail/user-detail.module').then(m => m.UserDetailModule),
      },
      { 
        path: 'leave-policy', 
        loadChildren: () => import('./components/leave-policy/leave-policy.module').then(m => m.LeavePolicyModule),
      },
      { 
        path: 'suprema-user', 
        loadChildren: () => import('./components/user-access-control/user-access-control.module').then(m => m.UserAccessControlModule),
      }
    ],
  },
];