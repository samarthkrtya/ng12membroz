import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DynamicWorkflowListComponent } from './dynamic-workflow-list.component';

export const DynamicWorkflowListRoutes: Routes = [
  { path: '', component: DynamicWorkflowListComponent },
  { path: 'list', component: DynamicWorkflowListComponent },
  { path: 'list/:formname', component: DynamicWorkflowListComponent },
  { path: 'list/:formname/:formlisting', component: DynamicWorkflowListComponent },
  { path: 'list/:formname/:formlisting/:extra', component: DynamicWorkflowListComponent },
  { path: 'list/:formname/:formlisting/online-course/:courseid/:classid', component: DynamicWorkflowListComponent },
];
export const routing: ModuleWithProviders<unknown> = RouterModule.forChild(DynamicWorkflowListRoutes);