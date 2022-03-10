import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IntegrationModuleRoutes } from './integration-module-routing';
import { IntegrationModuleComponent } from './integration-module.component';
import { DailydigestIntegrationComponent } from './components/dailydigest-integration/dailydigest-integration.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(IntegrationModuleRoutes),
  ],
  declarations: [
    IntegrationModuleComponent,
  ],
})
export class IntegrationModuleModule { }
