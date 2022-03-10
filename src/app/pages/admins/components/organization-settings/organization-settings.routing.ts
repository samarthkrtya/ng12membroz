import { Routes } from '@angular/router';

import { OrganizationSettingsComponent } from './organization-settings.component';

export const OrganizationSettingsRoutes: Routes = [
    {
      path: '', children: [ { path: '', component: OrganizationSettingsComponent }]
    }
];
