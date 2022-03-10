import { Routes, RouterModule } from '@angular/router';
import { ResortViewComponent } from './resort-view.component';

const routes: Routes = [
  { path: '', component: ResortViewComponent },
  { path: ':id', component: ResortViewComponent }
];
export const routing = RouterModule.forChild(routes);