import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Location } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from './../base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { ActivitiesService } from 'src/app/core/services/activitylogs/activities.service';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

import { filter } from 'rxjs/operators'
import { SubjectsService } from 'src/app/core/services/common/subjects.service';
import { XeroService } from 'src/app/core/services/xero/xero.service';
import { BranchesService } from 'src/app/core/services/branches/branch.service';
import { FormControl } from '@angular/forms';

const misc: any = {
    navbar_menu_visible: 0,
    active_collapse: true,
    disabled_collapse_init: 0,
};

declare var $: any;
@Component({
    selector: 'app-navbar-cmp',
    templateUrl: 'navbar.component.html',
    styleUrls: ['./navbar.scss']
})

export class NavbarComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit, OnDestroy {

    destroy$: Subject<boolean> = new Subject<boolean>();

    private listTitles: any[];
    location: Location;
    mobile_menu_visible: any = 0;
    private nativeElement: Node;
    private toggleButton: any;
    private sidebarVisible: boolean;
    private _router1: Subscription;

    isMemberLogin = false;
    actionLists = [];
    globalSearchVisible: boolean = false;
    quickform: boolean = true;
    settingmenu: boolean = true;
    calendarmenu: boolean = true;
    _alertCount: number = 0;
    usertype = "user"

    userName: string = '';
    profilepic: string = '';
    public _loginUserRoleType: any;
    public _loginMembershipId: any;
    isXeroConnected: any;
    orgId: any
    activitiesLists: any[] = [];
    _checkTasksSkipIds: any[] = [];

    followUpCounter: number;
    isXeroEnable = true;
    isWalletEnable = true;
    isSettingEnable = false;
    isSupportEnable = false;
    isAccandBillEnable: boolean = false;
    walletId: any;

    // idleState = 'Not started.';
    // timedOut = false;
    // lastPing?: Date = null;
    isActiveAutologout: boolean = false;

    branchView: boolean = false;
    branchList: any[] = [];
    branchContrl = new FormControl();

    @ViewChild('app-navbar-cmp', { static: false }) button: any;


    idleState: any = '';
    timedOut = false;
    lastPing?: Date = null;

    // browserRefresh = false;

    quickfromstyle = "multi";
    quickformschemaname = "resorts";

    constructor(
        location: Location,
        private element: ElementRef,
        private router: Router,
        private activitiesService: ActivitiesService,
        private idle: Idle,
        private XeroService: XeroService,
        private keepalive: Keepalive,
        private _subjectsService: SubjectsService,
        private _branchesService: BranchesService,
        

    ) {
        super();
        this.pagename = 'navbar';
        this.listTitles = [];
        this.location = location;
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
        this.globalSearchVisible = false;
        //this.minimizeSidebar();

    }

    // @HostListener('window:beforeunload', ['$event'])
    // beforeunloadHandler(event) {

    //     return false;
    //     if(this.browserRefresh) {

    //     } else {

    //         this._authService.logout();
    //     }


    // }

    minimizeSidebar() {
        const body = document.getElementsByTagName('body')[0];

        if (misc.sidebar_mini_active === true) {
            body.classList.remove('sidebar-mini');
            misc.sidebar_mini_active = false;

        } else {
            setTimeout(function () {
                body.classList.add('sidebar-mini');
                misc.sidebar_mini_active = true;
            }, 300);
        }

        // we simulate the window Resize so the charts will get updated in realtime.
        const simulateWindowResize = setInterval(function () {
            window.dispatchEvent(new Event('resize'));
        }, 180);

        // we stop the simulation of Window Resize after the animations are completed
        setTimeout(function () {
            clearInterval(simulateWindowResize);
        }, 1000);
    }

    hideSidebar() {
        const body = document.getElementsByTagName('body')[0];
        const sidebar = document.getElementsByClassName('sidebar')[0];

        if (misc.hide_sidebar_active === true) {
            setTimeout(function () {
                body.classList.remove('hide-sidebar');
                misc.hide_sidebar_active = false;
            }, 300);
            setTimeout(function () {
                sidebar.classList.remove('animation');
            }, 600);
            sidebar.classList.add('animation');

        } else {
            setTimeout(function () {
                body.classList.add('hide-sidebar');
                // $('.sidebar').addClass('animation');
                misc.hide_sidebar_active = true;
            }, 300);
        }

        // we simulate the window Resize so the charts will get updated in realtime.
        const simulateWindowResize = setInterval(function () {
            window.dispatchEvent(new Event('resize'));
        }, 180);

        // we stop the simulation of Window Resize after the animations are completed
        setTimeout(function () {
            clearInterval(simulateWindowResize);
        }, 1000);
    }

    autoLogout(timeoutsecond: number) {

        // sets an idle timeout of 5 seconds, for testing purposes.
        this.idle.setIdle(Number(timeoutsecond));
        // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
        this.idle.setTimeout(60);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => this.idleState = '');
        this.idle.onTimeout.subscribe(() => {
            this.idleState = 'Timed out!';
            this.timedOut = true;
            this.logout();
        });
        this.idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
        this.idle.onTimeoutWarning.subscribe((countdown) => this.idleState = 'You will time out in ' + countdown + ' seconds!');

        // sets the ping interval to 15 seconds
        this.keepalive.interval(15);

        this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

        this.reset();
    }

    reset() {
        this.idle.watch();
        this.idleState = '';
        this.timedOut = false;
    }

    async ngOnInit() {
        await super.ngOnInit();
        if(this._authService.currentUser) {
            this._loginUserRoleType = this._authService.currentUser.roletype;
            this._loginMembershipId = '';
            if (this._authService.currentUser.user && this._authService.currentUser.user['membershipid']) {
                this._loginMembershipId = this._authService.currentUser.user['membershipid']['_id'];
            }
            
            this.isXeroConnected = localStorage.getItem('xeroAuth')? localStorage.getItem('xeroAuth') : 'false';            
            this.orgId = this._authService.currentUser.organizationsetting._id;          

            if (this._loginUserRoleType == 'M') {
                this.isMemberLogin = true;
                this.usertype = "member"
                if (this._loginUserId) {
                    // this.getMemberTaskListsByLoginID();
                    // this.getWalletAccountIdByLoginId(this._loginUserId);
                    // this.getAllMemberAlerts()
                }
            } else {
                this.isMemberLogin = false;
                if (this._loginUserId && this._loginUserRoleId) {
                    // this.getdataByAR();
                }
            }
            //this.getFollowupLists(this._loginUserId);
            if (this._authService.currentUser.user) {
                
                this.userName = this._authService.currentUser.user.fullname;
            }
            this.profilepic = null;
            if (this._authService.currentUser.user.profilepic) {
                this.profilepic = this._authService.currentUser.user.profilepic;
            }
            
        }

        if(this._loginUserRole.permissions && this._loginUserRole.permissions.length > 0){
            const branch = this._loginUserRole.permissions.find(a=>a.formname == 'branch');
            if(branch && branch.recordpermission && branch.recordpermission.length > 0){
                let exist = branch.recordpermission.find(a=>a.type == "view" && a.datapermission == "All");
                this.branchView = !!exist;
            }
        }
        
        if(this.branchView){
            this.getAllBranches();
        }else{
            this.branchList = [];
            this.branchList = [this._loginUserBranch];
            this.branchContrl.setValue(this._loginUserBranch);
            this.branchContrl.disable()
        }
        
        this.isSettingEnable = false;
        this.isSupportEnable = false;
        
        
        this._subjectsService
            .behavioursubjects
            .pipe(takeUntil(this.destroy$))
            .subscribe((data)=>{
                
                if(data && data.length > 0 ){
                    let fnd = data.find(a=>a.menuname == 'clientsetting');
                    if(fnd){
                        this.isSettingEnable = true;
                    }
                    
                    let supportstr = this.isMemberLogin ? 'membersupport' : 'support';
                    let fndspt = data.find(a=>a.menuname == supportstr);
                    if(fndspt){
                        this.isSupportEnable = true;
                    }
                }
        })
        this.isAccandBillEnable = false;
        // if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
        //     var permsnObj = this._loginUserRole.permissions.find(p => p.formname == "myaccount")
        //     if (permsnObj && permsnObj.recordpermission && permsnObj.recordpermission.length > 0) {
        //         var per = permsnObj.recordpermission.find(a => a.type == 'view')
        //         if (per) {
        //             this.isAccandBillEnable = true;
        //         }
        //     }
        // }
      if (this._authService.currentUser.user && this._authService.currentUser.user.branchid && this._authService.currentUser.user.branchid.membrozid) {
        this.isAccandBillEnable = true;
      }

        // if (this._authService.auth_user && this._authService.auth_user.branchid && this._authService.auth_user.branchid._id) {
        //     this.isWalletEnable = this._authService.auth_user.branchid.iswalletenable ? this._authService.auth_user.branchid.iswalletenable : false;
        // }
 
        this.isWalletEnable = true;
        this.isXeroEnable = true;
        if(this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length > 0){
           let memberprms =  this._loginUserRole.permissions.find(a=>a.formname == 'member');
           let userprms =  this._loginUserRole.permissions.find(a=>a.formname == 'user');
           
           if(memberprms && memberprms.functionpermission && memberprms.functionpermission.length > 0){
                this.isWalletEnable = !memberprms.functionpermission.includes("Wallet Enable");
           }
           if(userprms && userprms.functionpermission && userprms.functionpermission.length > 0){
            this.isXeroEnable = !userprms.functionpermission.includes("Xero Enable");
           }
        } 
        
        this.isActiveAutologout = false;

        if (this._authService.currentUser && this._authService.currentUser['organizationsetting'] && this._authService.currentUser['organizationsetting']['autologouttimeout'] && this._authService.currentUser['organizationsetting']['autologouttimeout'] !== "") {
            this.autoLogout(Number(this._authService.currentUser['organizationsetting']['autologouttimeout']));
        } else {
            //this.autoLogout(60);
        }

        //this.listTitles = ROUTES.filter(listTitle => listTitle);



        const navbar: HTMLElement = this.element.nativeElement;
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton = navbar.getElementsByClassName('navbar-toggler')[0];
        if (body.classList.contains('sidebar-mini')) {
            misc.sidebar_mini_active = true;
        }
        if (body.classList.contains('hide-sidebar')) {
            misc.hide_sidebar_active = true;
        }
        this._router1 = this.router.events.pipe(takeUntil(this.destroy$)).filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
            this.sidebarClose();

            const $layer = document.getElementsByClassName('close-layer')[0];
            if ($layer) {
                $layer.remove();
            }
        });
        this._authService.uptData.pipe(takeUntil(this.destroy$)).subscribe(d => {
            if (d == 'alrt') this.getAData();
            if (d == 'tsk') this.getNData();
        });
        if (this._organizationsetting.quickform) {
          this.quickform = this._organizationsetting.quickform
        }
        else this.quickform = false

        if (this._organizationsetting.settingmenu) {
          this.settingmenu = this._organizationsetting.settingmenu
        }
        else this.settingmenu = false;

        if (this._organizationsetting.calendarmenu) {
          this.calendarmenu = this._organizationsetting.calendarmenu
        }
        else this.calendarmenu = false

        this.actionLists = this._organizationsetting && this._organizationsetting.globalsearch ? this._organizationsetting.globalsearch : ["member", "prospect", "user"];
        if (!this.actionLists || this.actionLists.length == 0) this.globalSearchVisible = false;
        else this.globalSearchVisible = true;

    }

    ngAfterViewInit() {
        this.getActivities();
    }

    getAllBranches(){
        let postData = {};
        postData['search'] = [];
        postData['search'].push({ searchfield: 'status', searchvalue: 'active', datatype: 'text', criteria: 'eq' })
        
        this.branchList = [];
        this._branchesService
            .getbyfilter(postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((datas : any)=>{
                this.branchList = datas;
                this.branchContrl.setValue(this.branchList.find(a=>a._id == this.globalBranchId));
            });
    }

    onGlobalBranch(){
        localStorage.setItem('globalbranch', JSON.stringify(this.branchContrl.value));
        this._authService.setBranch();
    }

    goToLink(url : string){
       window.open('//'+url, "_blank");
    }

    onResize(event) {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    }
    sidebarOpen() {
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function () {
            toggleButton.classList.add('toggled');
        }, 500);
        body.classList.add('nav-open');
        setTimeout(function () {
            $toggle.classList.add('toggled');
        }, 430);

        var $layer = document.createElement('div');
        $layer.setAttribute('class', 'close-layer');


        if (body.querySelectorAll('.main-panel')) {
            document.getElementsByClassName('main-panel')[0].appendChild($layer);
        } else if (body.classList.contains('off-canvas-sidebar')) {
            document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
        }

        // if (body.querySelectorAll('.wrapper-full-page')) {
        //     document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
        // }else if (body.classList.contains('off-canvas-sidebar')) {
        //     document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
        // }

        setTimeout(function () {
            $layer.classList.add('visible');
        }, 100);

        $layer.onclick = function () { //asign a function
            body.classList.remove('nav-open');
            this.mobile_menu_visible = 0;
            this.sidebarVisible = false;

            $layer.classList.remove('visible');
            setTimeout(function () {
                $layer.remove();
                $toggle.classList.remove('toggled');
            }, 400);
        }.bind(this);

        body.classList.add('nav-open');
        this.mobile_menu_visible = 1;
        this.sidebarVisible = true;
    };
    sidebarClose() {
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        var $layer = document.createElement('div');
        $layer.setAttribute('class', 'close-layer');

        this.sidebarVisible = false;
        body.classList.remove('nav-open');
        // $('html').removeClass('nav-open');
        body.classList.remove('nav-open');
        if ($layer) {
            $layer.remove();
        }

        setTimeout(function () {
            $toggle.classList.remove('toggled');
        }, 400);

        this.mobile_menu_visible = 0;
    };

    sidebarToggle() {
        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
    }

    logout() {

        const roleType = this._authService.auth_roletype;

        this._authService.logout();
        if (roleType !== 'M') {
            this._router.navigate(['login']);
        } else if (roleType === 'M') {
            this._router.navigate(['login/member']);
        } else {
            this._router.navigate(['login']);
        }
        $("html").attr("dir", "");
    }

    isMobileMenu() {
        if ($(window).width() < 991) {
            return false;
        }
        return true;
    }

    getActivities() {

        let postData = {};
        postData["search"] = [];
        postData["search"].push({ "searchfield": "assingeeuser", "searchvalue": this._loginUserId, "criteria": "eq", "datatype": "ObjectId", "cond": "or" });
        postData["search"].push({ "searchfield": "assingeerole", "searchvalue": this._loginUserRoleId, "criteria": "eq", "datatype": "ObjectId", "cond": "or" });
        postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
        postData["size"] = 10;
        postData["sort"] = { "duedate": -1 };


        this.activitiesService
            .GetByViewFilter(postData)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data: []) => {

                this.activitiesLists = data;
            });
    }


    gotoMyprofile() {

        const roleType = this._authService.auth_roletype;
        const loginUserId = this._authService.auth_id;
        if (roleType !== 'M') {
            this._router.navigate(['/pages/dynamic-forms/view/' + '/' + loginUserId]);
        } else if (roleType === 'M') {
            if (loginUserId != undefined && loginUserId != '') {
                this._router.navigate(['/pages/dynamic-forms/view/' + '/' + loginUserId]);
            }
        } else {
            this._router.navigate(['login']);
        }
    }

    gotoMysettings() {
        const roleType = this._authService.auth_roletype;
        const loginUserId = this._authService.auth_id;
        if (roleType !== 'M') {
            //this._router.navigate(['pages/admins/admin-settings']);
            this._router.navigate(['pages/usersmembers-settings']);
        } else if (roleType === 'M') {
            //this._router.navigate(['pages/members/members-settings']);
            this._router.navigate(['pages/usersmembers-settings']);
        } else {
            this._router.navigate(['login']);
        }
    }

    getNData() {
        if (this._authService.currentUser.roletype == 'M') {
            if (this._loginUserId) {
                //this.getMemberTaskListsByLoginID();
            }
        } else {
            if (this._loginUserId && this._loginUserRoleId) {
                //this.getdataByAR();
            }
        }
    }
    getAData() {
        //this.getAllMemberAlerts();
    }

    isNotMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    }

    getTitle() {

        var titlee = this.location.prepareExternalUrl(this.location.path());

        if (titlee.charAt(0) === '#') {
            titlee = titlee.slice(1);
        }
        for (let i = 0; i < this.listTitles.length; i++) {
            if (this.listTitles[i].type === "link" && this.listTitles[i].path === titlee) {
                return this.listTitles[i].title;
            } else if (this.listTitles[i].type === "sub") {
                for (let j = 0; j < this.listTitles[i].children.length; j++) {
                    let subtitle = this.listTitles[i].path + '/' + this.listTitles[i].children[j].path;
                    if (subtitle === titlee) {
                        return this.listTitles[i].children[j].title;
                    }
                }
            }
        }
        return 'Dashboard';
    }
    getPath() {
        return this.location.prepareExternalUrl(this.location.path());
    }

    onSelectOptionValue(action: any) {
        if (action["selectedAction"] && action._id) {
            if (action["selectedAction"] == "prospect") {
                this._router.navigate(['/pages/customer-module/profile/' + action._id]);
            } else if (action["selectedAction"] == "member") {
                this._router.navigate(['/pages/members/profile/' + action._id]);
            } else if (action["selectedAction"] == "user") {
                this._router.navigate(['/pages/user/profile/' + action._id + '/598998cb6bff2a0e50b3d793']);
            }
        }
    }

    ngOnDestroy() {
        this._subjectsService.behavioursubjects.next(null);

        this.destroy$.next(true);
        this.destroy$.unsubscribe();
        //this._authService.logout();
    }

    connectToXeroBtn() {
        this.XeroService
        .ConnectToXero()
        .subscribe((data: any) => {              
            window.location.href = data.url;
        });
    }

    openMyprofile() {
         this.router.navigateByUrl('/pages/myprofile/' + this.usertype);
    }

    disconnectToXeroBtn() {
        let postData = {}
        postData["orgId"] = this.orgId; 

        if (confirm('Are you sure you want to disconnect your xero account?')) {
            this.XeroService.DisconnectToXero(postData)
            .subscribe((data: any) => {   
                localStorage.setItem('xeroAuth', 'false');   
                this.showNotification('top', 'right', data.Message, data.Status);            
                location.reload();
            });
        }else {
            return false;
        }
    } 

}
