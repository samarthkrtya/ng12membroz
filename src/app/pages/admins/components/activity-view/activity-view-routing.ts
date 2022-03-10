import { Routes, RouterModule } from '@angular/router';
import { ActivityViewComponent } from './activity-view.component';


const routes: Routes = [
  { path: '', component: ActivityViewComponent },
  { path: ':id', component: ActivityViewComponent },
];

export const routing = RouterModule.forChild(routes);
