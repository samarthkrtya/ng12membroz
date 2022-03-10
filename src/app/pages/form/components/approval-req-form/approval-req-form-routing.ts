import { Routes, RouterModule } from '@angular/router';
import {  ApprovalReqFormComponent } from './approval-req-form.component';

const routes: Routes = [
  { path: '', component: ApprovalReqFormComponent },
  { path: ':formname/:schemaname/:id', component: ApprovalReqFormComponent },
  { path: 'view/:formname/:id', component: ApprovalReqFormComponent }
];
export const routing = RouterModule.forChild(routes);