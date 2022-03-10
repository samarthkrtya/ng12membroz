import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DynamicListComponent } from './dynamic-list.component';

export const DynamicListRoutes: Routes = [
  { path: '', component: DynamicListComponent },
  { path: 'list', component: DynamicListComponent },
  { path: 'list/:formname', component: DynamicListComponent },
  { path: 'list/:formname/:formlisting', component: DynamicListComponent },
  { path: 'list/:formname/:formlisting/:extra', component: DynamicListComponent },
  { path: 'list/:formname/:formlisting/online-course/:courseid/:classid', component: DynamicListComponent },
];
export const routing: ModuleWithProviders<unknown> = RouterModule.forChild(DynamicListRoutes);