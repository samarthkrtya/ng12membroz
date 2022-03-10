import { Routes, RouterModule } from '@angular/router';
import { InviteEarnComponent } from './invite-earn.component';

const routes: Routes = [
  { path: '', component: InviteEarnComponent },
];
export const routing = RouterModule.forChild(routes);