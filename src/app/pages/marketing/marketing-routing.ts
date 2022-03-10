import { Routes } from '@angular/router';
import { MarketingComponent } from './marketing.component';

export const MarketingRoutes: Routes = [
  {
    path: '', component: MarketingComponent,
    children: [
      {
        path: 'sales-channel',
        loadChildren: () => import('./components/sales-channel/sales-channel.module').then(m => m.SalesChannelModule),
      },
      {
        path: 'sales-channel-team',
        loadChildren: () => import('./components/sales-channel-team/sales-channel-team.module').then(m => m.SalesChannelTeamModule),
      },
    ]
  }
];