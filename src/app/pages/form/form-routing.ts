import { Routes } from '@angular/router';
import { FormComponent } from './form.component';

export const FormRoutes: Routes = [
  {
    path: '', component: FormComponent,
    children: [
      {
         path: 'profile', 
        loadChildren: () => import('./components/form-detail/form-detail.module').then(m => m.FormDetailModule), 
      },
      { 
       path: 'approval-req-form', 
       loadChildren: () => import('./components/approval-req-form/approval-req-form.module').then(m => m.ApprovalReqFormModule), 
      },
    ],
  },
];