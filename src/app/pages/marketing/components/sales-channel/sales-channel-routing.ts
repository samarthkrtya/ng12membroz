import { Routes, RouterModule } from '@angular/router';
import { SalesChannelComponent } from './sales-channel.component';

const routes: Routes = [
  { path: ':id', component: SalesChannelComponent },
];
export const routing = RouterModule.forChild(routes);