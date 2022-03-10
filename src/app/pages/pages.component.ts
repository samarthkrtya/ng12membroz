import { Component, OnInit, OnDestroy, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import PerfectScrollbar from 'perfect-scrollbar';
import { filter } from 'rxjs/operators';
import { UrlService } from '../core/services/common/url.service';
import { BaseLiteComponemntComponent } from '../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
declare const $: any;

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.scss'],
})

export class PagesComponent extends BaseLiteComponemntComponent implements OnInit {
  
  public navItems: any[];
  private lastPoppedUrl: string;
  private yScrollStack: number[] = [];
  url: string;
  location: Location;

  _subscription : Subscription;

  previousUrl: string = null;
  currentUrl: string = null;

  expiringin: Number;

  @ViewChild('sidebar', {static: false}) sidebar: any;
  @ViewChild(NavbarComponent, {static: false}) navbar: NavbarComponent;
  constructor( 
    public router: Router,
      location: Location,
      public urlService: UrlService 
      ) {
          super();
        this.location = location;
  }

 async ngOnInit() {
     await super.ngOnInit();


        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd)
        ).subscribe((event: NavigationEnd) => {
            this.previousUrl = this.currentUrl;
            this.currentUrl = event.url;
            this.urlService.setPreviousUrl(this.previousUrl);
        });

      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
      this.location.subscribe((ev:PopStateEvent) => {
          this.lastPoppedUrl = ev.url;
      });
       this.router.events.subscribe((event:any) => {
          if (event instanceof NavigationStart) {
             if (event.url != this.lastPoppedUrl)
                 this.yScrollStack.push(window.scrollY);
         } else if (event instanceof NavigationEnd) {
             if (event.url == this.lastPoppedUrl) {
                 this.lastPoppedUrl = undefined;
                 window.scrollTo(0, this.yScrollStack.pop());
             }
             else
                 window.scrollTo(0, 0);
         }
      });
      this._subscription = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
           elemMainPanel.scrollTop = 0;
           elemSidebar.scrollTop = 0;
      });
      const html = document.getElementsByTagName('html')[0];
      if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
          let ps = new PerfectScrollbar(elemMainPanel);
          ps = new PerfectScrollbar(elemSidebar);
          html.classList.add('perfect-scrollbar-on');
      }
      else {
          html.classList.add('perfect-scrollbar-off');
      }
      this._subscription = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
        this.navbar.sidebarClose();
      });

      

      if (this._authService && this._authService.currentUser && this._authService.currentUser.user && this._authService.currentUser.user.branchid && this._authService.currentUser.user.branchid.membrozid) {
        var membershipend = this._authService.currentUser.user.branchid.membrozid.membershipend;
        membershipend = new Date(membershipend);
        // To set two dates to two variables
        var today = new Date();
        // To calculate the time difference of two dates
        var Difference_In_Time = membershipend.getTime() - today.getTime();
        // To calculate the no. of days between two dates
        this.expiringin = Math.ceil(Difference_In_Time / (1000 * 3600 * 24));
        
      }
  }


  ngAfterViewInit() {
      this.runOnRouteChange();
  }

  public isMap() {
      if (this.location.prepareExternalUrl(this.location.path()) === '/maps/fullscreen') {
          return true;
      } else {
          return false;
      }
  }

  closeBtn(){
    document.getElementById("ofBar").style.display = 'none';
  }

  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar);
      ps.update();
    }
  }

  isMac(): boolean {
      let bool = false;
      if (navigator.platform.toUpperCase().indexOf('MAC') >= 0 || navigator.platform.toUpperCase().indexOf('IPAD') >= 0) {
          bool = true;
      }
      return bool;
  }
}
