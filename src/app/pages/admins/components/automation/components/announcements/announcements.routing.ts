import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import {AnnouncementsComponent  } from './announcements.component';


export const AnnouncementsRoutes: Routes = [
  { path: '', component: AnnouncementsComponent },
  { path: 'form/:formid', component: AnnouncementsComponent },
 { path: 'form/:formid/:id', component: AnnouncementsComponent },
];
export const routing = RouterModule.forChild(AnnouncementsRoutes);

