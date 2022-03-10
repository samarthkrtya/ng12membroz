import { Routes, RouterModule } from '@angular/router';
import { InternalNotificationsComponent } from './internal-notifications.component';

const routes: Routes = [
  { path: '', component: InternalNotificationsComponent },
  { path: ':id', component: InternalNotificationsComponent },
];

export const routing = RouterModule.forChild(routes);
