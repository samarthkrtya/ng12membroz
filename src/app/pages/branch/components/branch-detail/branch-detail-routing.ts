import { Routes, RouterModule } from '@angular/router';
import { BranchDetailComponent } from './branch-detail.component';

const routes: Routes = [
  { path: '', component: BranchDetailComponent },
  { path: ':id', component: BranchDetailComponent },
  { path: ':id/:formid', component: BranchDetailComponent },
];
export const routing = RouterModule.forChild(routes);