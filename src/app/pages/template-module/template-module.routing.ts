import { Routes } from '@angular/router';
import { TemplateModuleComponent } from './template-module.component';

export const TemplateRoutes: Routes = [
  {
    path: '', component: TemplateModuleComponent,
    children: [
      { 
        path: 'html-editor', 
        loadChildren: () => import('./components/html-editor/html-editor.module').then(m => m.HTMLEditorModule),
      },
      { 
        path: 'angular-editor', 
        loadChildren: () => import('./components/template-design/template-design.module').then(m => m.TemplateDesignModule),
      },
      { 
        path: 'template', 
        loadChildren: () => import('./components/template/template.module').then(m => m.TemplateModule),
      },
      { 
        path: 'form', 
        loadChildren: () => import('./components/template-form/template-form.module').then(m => m.TemplateFormModule),
      },
      
    ],
  },
];