import { NgModule, Injector } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { AppComponent } from './app.component';

import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { FixedpluginModule} from './shared/fixedplugin/fixedplugin.module';


import { AppRoutes } from './app.routing';

import { PagesModule } from './pages/pages.module';

import { Configuration } from './app.constants';

import { AppInjector } from './app-injector.service';
import { AuthService } from './core/services/common/auth.service';
import { UrlService } from './core/services/common/url.service';
import { AuthGuard } from './core/services/common/auth-guard.service';
import { UserloginService } from './core/services/userlogin/userlogin.service';
import { CommonDataService } from './core/services/common/common-data.service';

import { HttpErrorInterceptor } from './core/services/common/http-error.interceptor';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';


@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        RouterModule.forRoot(AppRoutes,{
          //useHash: true
        }),
        HttpClientModule,
        PagesModule,
        SidebarModule,
        NavbarModule,
        FooterModule,
        FixedpluginModule,
        AngularFireModule.initializeApp(environment.firebaseConfig, 'mychatapp'),
        AngularFirestoreModule, 
        AngularFireAuthModule, 
        AngularFireStorageModule 
    ],
    declarations: [
      AppComponent,
    ],
    providers : [
      Configuration,
      AuthGuard,
      AuthService,
      UserloginService,
      CommonDataService,
      {
        provide: HTTP_INTERCEPTORS,
        useClass: HttpErrorInterceptor,
        multi: true
      },
      UrlService
    ],
    bootstrap:    [ AppComponent ]
})
export class AppModule {
  constructor(injector:Injector){
    // Store module's injector in the AppInjector class
    // //console.log('Expected #1: storing app injector');
    AppInjector.setInjector(injector);
    }
 }