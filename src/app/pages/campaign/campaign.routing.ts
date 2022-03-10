import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CampaignComponent } from './campaign.component';

export const CampaignRoutes: Routes = [
  {
    path: '', component: CampaignComponent,
    children: [
      { 
        path: 'form', 
        loadChildren: () => import('./components/campaign-form/campaign-form.module').then(m => m.CampaignFormModule),
      },
      { 
        path: 'template', 
        loadChildren: () => import('./components/campaign-template/campaign-template.module').then(m => m.CampaignTemplateModule),
      },
      { 
        path: 'dashboard', 
        loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      { 
        path: 'template-design', 
        loadChildren: () => import('./components/template-design/template-design.module').then(m => m.ExampleModule),
      },
      { 
        path: 'recipients', 
        loadChildren: () => import('./components/contact-list/contact-list.module').then(m => m.ContactListModule),
      },
      { 
        path: 'confirmation-template', 
        loadChildren: () => import('./components/confirmation-template/confirmation-template.module').then(m => m.ConfirmationTemplateModule),
      },
      { 
        path: 'template-form', 
        loadChildren: () => import('./components/template-form/template-form.module').then(m => m.TemplateFormModule),
      },
      { 
        path: 'htmleditor', 
        loadChildren: () => import('./components/html-template/html-template.module').then(m => m.HtmlTemplateModule),
      },
    ],
  },
];