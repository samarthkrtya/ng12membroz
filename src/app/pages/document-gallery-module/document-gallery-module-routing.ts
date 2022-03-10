import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DocumentGalleryModuleComponent } from './document-gallery-module.component';

export const DocumentGalleryModuleRoutes: Routes = [
  {
    path: '', component: DocumentGalleryModuleComponent,
    children: [
      { 
        path: 'documents', 
        loadChildren: () => import('./components/documents/documents.module').then(m => m.DocumentsModule),
      }
    ],
  },
];