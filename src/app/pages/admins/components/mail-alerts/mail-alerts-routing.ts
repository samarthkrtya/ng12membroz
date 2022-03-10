import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { MailAlertsComponent } from './mail-alerts.component';
import { FormComponent } from './form/form.component';
 
export const  MailAlertsRoutes: Routes = [
  { path: '', component: MailAlertsComponent },  
  { path: 'form', component: FormComponent },
  { path: 'form/:id', component: FormComponent },
];


