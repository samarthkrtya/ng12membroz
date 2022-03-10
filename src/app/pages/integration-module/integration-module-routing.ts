import { Routes } from '@angular/router';

import { IntegrationModuleComponent } from './integration-module.component';

export const IntegrationModuleRoutes: Routes = [
  {
    path: '', component: IntegrationModuleComponent,
    children: [
      {
        path: 'lists',
        loadChildren: () => import('./components/integration-lists/integration-lists.module').then(m => m.IntegrationListsModule),
      },
      {
        path: 'survey-integration',
        loadChildren: () => import('./components/survey-integration/survey-integration.module').then(m => m.SurveyIntegrationModule),
      },
      {
        path: 'template-integration',
        loadChildren: () => import('./components/template-integration/template-integration.module').then(m => m.TemplateIntegrationModule),
      },
      {
        path: 'scheduler-integration',
        loadChildren: () => import('./components/scheduler-integration/scheduler-integration.module').then(m => m.TemplateIntegrationModule),
      },
      {
        path: 'dailydigest-integration',
        loadChildren: () => import('./components/dailydigest-integration/dailydigest-integration.module').then(m => m.DailydigestIntegrationModule),
      }

    ],
  },
];
