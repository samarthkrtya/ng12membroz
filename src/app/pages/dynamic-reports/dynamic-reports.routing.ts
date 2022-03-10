import { Routes, RouterModule } from '@angular/router';
import { DynamicReportsComponent } from './dynamic-reports.component';

const routes: Routes = [
  {
    path: '', component: DynamicReportsComponent,
    children: [
      {
        path: 'reports-list',
        loadChildren: () => import('./components/reports-list/reports-list.module').then(m => m.ReportsListModule),
      },
      {
        path: 'report-view',
        loadChildren: () => import('./components/report-view/report-view.module').then(m => m.ReportViewModule),
      },
      {
        path: 'report-settings',
        loadChildren: () => import('./components/report-settings/report-settings.module').then(m => m.ReportSettingsModule),
      },

    ]
  }
];

export const routing = RouterModule.forChild(routes);