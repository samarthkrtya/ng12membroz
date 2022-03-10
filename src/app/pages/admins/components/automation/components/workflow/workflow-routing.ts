import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import {WorkflowComponent  } from './workflow.component';

export const WorkflowRoutes: Routes = [
  { path: '', component: WorkflowComponent },
  { path: ':id', component: WorkflowComponent },
];
export const routing = RouterModule.forChild(WorkflowRoutes);

