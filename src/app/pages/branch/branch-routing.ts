import { Routes } from '@angular/router';
import { BranchComponent } from './branch.component';

export const BranchRoutes: Routes = [
  {
    path: '', component: BranchComponent,
    children: [
      { 
        path: 'profile', 
        loadChildren: () => import('./components/branch-detail/branch-detail.module').then(m => m.BranchDetailModule),
      }
    ],
  },
];