import { Routes, RouterModule } from '@angular/router';
import { AutomationComponent } from './automation.component';
import { ModuleWithProviders } from '@angular/core';

export const AutomationRoutes: Routes = [
  {
    path: '', component: AutomationComponent,
    children: [
      {
        path: 'announcements',
        loadChildren: () => import('./components/announcements/announcements.module').then(m => m.AnnouncementsModule),
      },
      {
        path: 'workflow',
        loadChildren: () => import('./components/workflow/workflow.module').then(m => m.WorkflowModule),
      },
    ],
  },
];