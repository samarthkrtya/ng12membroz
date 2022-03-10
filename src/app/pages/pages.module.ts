import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SidebarModule } from '../sidebar/sidebar.module';
import { NavbarModule} from '../shared/navbar/navbar.module';
import { FooterModule } from '../shared/footer/footer.module';
import { FixedpluginModule} from '../shared/fixedplugin/fixedplugin.module';

import { PagesRoutes } from './pages.routing';

import { PagesComponent } from './pages.component';
import { LoginComponent } from './login/login.component';

import { AppMaterialModule } from '../app-material/app-material.module';
import { MatNativeDateModule} from '@angular/material/core';
import { UrlService } from '../core/services/common/url.service';
import { RoleComponent } from './role/role.component';
import { BranchComponent } from './branch/branch.component';
import { FormComponent } from './form/form.component';
import { UserCheckinComponent } from './user-checkin/user-checkin.component';
import { XeroComponent } from './xero/xero.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    NavbarModule,
    FooterModule,
    FixedpluginModule,
    AppMaterialModule,
  ],
  declarations: [
    PagesComponent,
    LoginComponent,
    UserCheckinComponent,
    XeroComponent,

  ],
  providers:[
    MatNativeDateModule,
    UrlService,
    DatePipe
  ]
})

export class PagesModule {}
