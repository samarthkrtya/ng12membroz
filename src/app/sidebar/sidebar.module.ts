import { BranchesService } from './../core/services/branches/branch.service';
import { CompanySettingService } from './../core/services/admin/company-setting.service';
import { CompanyProfileService } from './../core/services/admin/company-profile.service';
import { MenupermissionsService } from './../core/services/menu/menupermissions.service';
import { MenuService } from './../core/services/menu/menu.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@NgModule({
    imports: [ RouterModule, CommonModule ],
    declarations: [ SidebarComponent ],
    exports: [ SidebarComponent ],
    providers: [
        MenuService,
        MenupermissionsService,
        CompanyProfileService,
        CompanySettingService,
        BranchesService,
        //UsertasksService,
        //FollowupService,
        //CampaignService,
        //WalletaccountService,
    ]
})

export class SidebarModule {}
