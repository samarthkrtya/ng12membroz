import { Routes, RouterModule } from '@angular/router';
import { SalesChannelTeamComponent } from './sales-channel-team.component';

const routes: Routes = [
  { path: ':id', component: SalesChannelTeamComponent },
];
export const routing = RouterModule.forChild(routes);