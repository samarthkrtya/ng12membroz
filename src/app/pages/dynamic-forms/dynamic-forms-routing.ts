import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { DynamicFormsComponent } from './dynamic-forms.component';
import { ViewComponent } from './view/view.component';

//import { PendingChangesGuard } from './../../core/services/common/pendingchanges-guard.service';

export const DynamicFormsRoutes: Routes = [
  { path: '', component: DynamicFormsComponent},
  { path: 'form', component: DynamicFormsComponent },
  { path: 'form/:formid', component: DynamicFormsComponent },
  { path: 'form/:formid/:id', component: DynamicFormsComponent },
  { path: 'form/:formid/:contextid/:onModel', component: DynamicFormsComponent },
  { path: 'view/:id', component: ViewComponent },
  { path: 'view/form/:formid/:id', component: ViewComponent },
];

export const routing: ModuleWithProviders<unknown> = RouterModule.forChild(DynamicFormsRoutes);