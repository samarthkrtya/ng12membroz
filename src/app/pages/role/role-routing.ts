import { Routes } from '@angular/router';
import { RoleComponent } from './role.component';

export const RoleRoutes: Routes = [
  {
    path: '', component: RoleComponent,
    children: [
      { 
         path: 'profile', 
        loadChildren: () => import('./components/role-detail/role-detail.module').then(m => m.RoleDetailModule), 
      }
    ],
  },
];