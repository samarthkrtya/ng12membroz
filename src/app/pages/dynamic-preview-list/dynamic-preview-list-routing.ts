import { RouterModule, Routes } from '@angular/router';
import { DynamicPreviewListComponent } from './dynamic-preview-list.component';

export const Route: Routes = [
  { path: ':formname/:id', component: DynamicPreviewListComponent }
];

export const routing = RouterModule.forChild(Route);