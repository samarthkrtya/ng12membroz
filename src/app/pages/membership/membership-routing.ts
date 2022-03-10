import { Routes } from '@angular/router';
import { MembershipComponent } from './membership.component';

export const MembershipRoutes: Routes = [
  {
    path: '', component: MembershipComponent,
    children: [
      { 
        path: 'view', 
        loadChildren: () => import('./components/membership-detail/membership-detail.module').then(m => m.MembershipModule),
      },
      { 
        path: 'class', 
        loadChildren: () => import('./components/group-class/group-class.module').then(m => m.GroupclassModule),
      },
    ],
  },
];