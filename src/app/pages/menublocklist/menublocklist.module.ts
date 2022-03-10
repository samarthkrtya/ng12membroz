import { MenupermissionsService } from './../../core/services/menu/menupermissions.service';
import { MenuService } from './../../core/services/menu/menu.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './menublocklist.routing';
import { MenublocklistComponent } from './menublocklist.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
  ],
  declarations: [
    MenublocklistComponent
  ],
  providers: [
    MenuService,
    MenupermissionsService
  ]
})
export class MenublocklistModule {}