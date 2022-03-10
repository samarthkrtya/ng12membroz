import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentModuleComponent } from './document-module.component';

export const DocumentModuleRoutes: Routes = [
  {
    path: '', component: DocumentModuleComponent,
    children: [
      { 
        path: 'desginer', 
        loadChildren: () => import('./components/document-designer/document-designer.module').then(m => m.DocumentDesignerModule),
      },
      { 
        path: 'form', 
        loadChildren: () => import('./components/document-form/document-form.module').then(m => m.DocumentFormModule),
      },
      { 
        path: 'document-template', 
        loadChildren: () => import('./components/document-template-lists/document-template-lists.module').then(m => m.DocumentTemplateListsModule),
      }
      
    ],
  },
];