import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorModuleComponent } from './vendor-module.component';


export const VendorModuleRoutes: Routes = [
  {
    path: '', component: VendorModuleComponent,
    children: [
      { 
        path: 'profile', 
        loadChildren: () => import('./components/vendor-profile/vendor-profile.module').then(m => m.VendorProfileModule),
      },
      // { 
      //   path: 'conversion', 
      //   loadChildren: () => import('./components/vendor-conversion/vendor-conversion.module').then(m => m.VendorConversionModule),
      // },
      
    ],
  },
];