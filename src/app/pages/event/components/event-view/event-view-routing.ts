import { Routes, RouterModule } from '@angular/router';
import { EventViewComponent } from './event-view.component';

const routes: Routes = [
  { path: ':id/:fid', component: EventViewComponent },
  { path: ':id', component: EventViewComponent }
];
export const routing = RouterModule.forChild(routes);