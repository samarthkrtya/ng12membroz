import { PendingChangesGuard } from './../../core/services/common/pendingchanges-guard.service';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { ImportComponent } from './import.component';

export const ImportRoutes: Routes = [
  { path: '', component: ImportComponent, canDeactivate: [PendingChangesGuard] },
  { path: ':id', component: ImportComponent, canDeactivate: [PendingChangesGuard] },
  { path: ':id/:param', component: ImportComponent, canDeactivate: [PendingChangesGuard] },
];

export const routing: ModuleWithProviders<unknown> = RouterModule.forChild(ImportRoutes);