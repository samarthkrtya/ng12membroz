import { AfterViewInit, Component, OnInit } from '@angular/core';

import PerfectScrollbar from 'perfect-scrollbar';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { BaseComponemntComponent, BaseComponemntInterface } from '../shared/base-componemnt/base-componemnt.component';

import { BranchesService } from './../core/services/branches/branch.service';
import { CompanySettingService } from './../core/services/admin/company-setting.service';
import { MenuService } from './../core/services/menu/menu.service';
import { AuthService } from './../core/services/common/auth.service';
import { SubjectsService } from '../core/services/common/subjects.service';
import { ActivitiesService } from '../core/services/activitylogs/activities.service';
declare const $: any;
@Component({
    selector: 'app-sidebar-cmp',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['./sidebar.scss']
})

export class SidebarComponent extends BaseComponemntComponent implements BaseComponemntInterface, OnInit, AfterViewInit {

    ps: any;

    public username: string;
    public profilePicPath: string;
    public authRole: string;
    allMenus: any [] = [];
    selectedMenus: any [] = [];
    removeMenus: any [] = [];

    _taskLists: any [] = [];
    _checkTasksSkipIds: any [] = [];
    _notificationCounter: number = 0;

    _moduleVisibilityStatus: boolean = false;
    _notificationVisibilityStatus: boolean = false;

    logoPath: any;
    isLoadLogo = true;
    followUpCounter: number;

    allSaleschannelTeamIds: any [] = [];
    selectedSaleschannelTeamIds: any;
    selectedCampaignId: any;

    isMemberLogin = false;
    isSettingEnable = false;
    isSupportEnable = false;
    isAccandBillEnable: boolean = false;
    calendarmenu: boolean = false;

    isWalletEnable = false;
    walletId: any;
    language: any;

    firstTC: string = 'M';
    cSolutionType: string;
    accMenu: any;

    companysett:any;

    activitiesLists: any[] = [];

    destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private authService: AuthService,
        private _menuService: MenuService,
        private companySettingService: CompanySettingService,
        private _branchesService: BranchesService,
        private _subjectsService: SubjectsService,
        private activitiesService: ActivitiesService,
    ) {


        super();

        this.pagename = "menu";

        this.cSolutionType = '';
        this.language = "en";

        this.isSettingEnable = false;
        this.isSupportEnable = false;
        this.isAccandBillEnable = false;
        this.isMemberLogin = false;

        if(this.authService.auth_user != undefined && this.authService.auth_user.branchid != undefined && this.authService.auth_user.branchid._id != undefined){
            this.isWalletEnable = this.authService.auth_user.branchid.iswalletenable != undefined ? this.authService.auth_user.branchid.iswalletenable : false;
        }

        this.followUpCounter = 0;

        if (JSON.parse(localStorage.getItem('currentUser')) !== null) {
            this.authRole = this.authService.auth_roletype;
            if(this.authRole == 'M'){
                this.isMemberLogin = true;
            } else {
                this.isMemberLogin = false;
            }
        }

        if(this.authService.currentUser) {
            if(this.authService.currentUser.language) {
                this.language = this.authService.currentUser.language;
            }

            if(this.authService.currentUser.user != undefined && this.authService.currentUser.user.branchid != undefined && this.authService.currentUser.user.branchid.solutiontype != undefined){
                this.cSolutionType = this.authService.currentUser.user.branchid.solutiontype;
            }

            if(this.authService.currentUser.user) {
                this.username = this.authService.currentUser.user.fullname;
            }

            if(this.authService.currentUser.organizationsetting) {
                this.companysett = this.authService.currentUser.organizationsetting;
            }

            if(this.companysett != undefined && this.companysett['shorttitle'] != undefined && this.companysett['shorttitle'] != ''){
                let tmpst: string = this.companysett['shorttitle'];
                if(tmpst != undefined){
                    this.firstTC = tmpst.toUpperCase();
                }
            } else if(this.companysett != undefined && this.companysett['webtitle'] != undefined && this.companysett['webtitle'] != '') {
                let tmpst: string = this.companysett['webtitle'];
                if(tmpst != undefined){
                    tmpst = tmpst.trim().substr(0,1);
                    this.firstTC = tmpst.toUpperCase();
                }
            }

            if(this.companysett != undefined && this.companysett['databasetype'] != undefined && this.companysett['databasetype'] == 'branchwise') {
                if(this.authService.auth_user != undefined && this.authService.auth_user.branchid != undefined &&  this.authService.auth_user.branchid._id != undefined){
                    if(this.authService.auth_user.branchid.branchlogo != undefined){
                        this.logoPath = this.authService.auth_user.branchid.branchlogo;
                        this.isLoadLogo = false;
                    } else {
                        this.isLoadLogo = false;
                        if(this.companysett != undefined && this.companysett['logo']) {
                            this.logoPath = this.companysett['logo'];
                            this.isLoadLogo = false;
                        }
                    }
                } else {
                    this.isLoadLogo = false;
                    if(this.companysett != undefined && this.companysett['logo']) {
                        this.logoPath = this.companysett['logo'];
                        this.isLoadLogo = false;
                    }
                }

            } else if(this.companysett != undefined && this.companysett['logo']) {
                this.logoPath = this.companysett['logo'];
                this.isLoadLogo = false;
            }
            if(this.companysett != undefined && this.companysett['calendarmenu'] != undefined && this.companysett['calendarmenu'] != null ){
                this.calendarmenu = this.companysett.calendarmenu
            } else {
                this.calendarmenu = false;
            }
            if (this._authService.currentUser.user && this._authService.currentUser.user.branchid && this._authService.currentUser.user.branchid.membrozid) {
                this.isAccandBillEnable = true;
            }
        }


    }

    async ngOnInit() {

        await super.ngOnInit();

        try {
            await this.getAllMenus();
            if(this.allMenus.length > 0){
                this.selectedMenus = await this.list_to_tree(this.allMenus)
                
                this._subjectsService.behavioursubjects.next(this.selectedMenus);
            }
        } catch (error) {
            console.error({ error });
        } finally {

        }

        this.authService.updData.subscribe( d => {this.getipath();});
        this.authService.uptData.subscribe( d => {if(d = 'tsk') this.getNData();});

        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            const elemSidebar = <HTMLElement>document.querySelector('.sidebar .sidebar-wrapper');
            this.ps = new PerfectScrollbar(elemSidebar);
        }

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
        });
    }

    ngAfterViewInit() {
        this.getActivities();
    }

    ngOnDestroy() {
        this.destroy$.next(true);
        // Unsubscribe from the subject
        this.destroy$.unsubscribe();
    }

    LoadData() {}
    Save() {}
    Update() {}
    Delete() {}
    ActionCall() {}

    async getAllMenus() {

        let postData = {};
        postData["search"] = [];
        postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria" : "eq" });
        postData["search"].push({ "searchfield": "roleid", "searchvalue": this._loginUserRoleId, "datatype": "ObjectId", "criteria": "eq"});
        postData["search"].push({ "searchfield": "parent", "searchvalue": false, "datatype": "Boolean", "criteria": "exists" });
        postData["sort"] = { "menuindex": 1 };

        return this._menuService
            .AsyncGetAllUserMenuByFilter(postData)
            .then((data:any)=>{
                if(data) {
                    this.allMenus = data;
                    // this.accMenu = this.allMenus.find(ele4 => ele4.menuname == 'adminaccount');
                    // this.allMenus = this.allMenus.filter(ele8 => ele8.menuname != 'adminaccount');
                    // if(this.authRole == 'M' && this.cSolutionType != ''){
                    //     this.allMenus = this.allMenus.filter(ele58 => ele58.solutiontype == undefined || (ele58.solutiontype != undefined && ele58.solutiontype.includes(this.cSolutionType)));
                    // }
                    return;
                }
            });
    }


    async list_to_tree(list: any) {

        var map = {}, node, roots = [], i;
        let cnt = 0;
        for (i = 0; i < list.length; i += 1) {
            if (!list[i].parent) {
                map[list[i].menuname] = cnt;
                cnt++;
            }

            list[i].children = [];
        }
        for (i = 0; i < list.length; i += 1) {
            node = list[i];

            if (node.parent) {
                let obj = {
                    text: this.langResource[node.menuname] ? this.langResource[node.menuname] : node.title,
                    value: node._id,
                    checked: false,
                    materialicon: node.materialicon,
                    shortname: node.shortname,
                    url: node.url,
                    group: node.group != undefined ? node.group : undefined,
                };


                if(roots[map[node.parent]]){

                    if(!roots[map[node.parent]]['children']) {
                        roots[map[node.parent]]['children'] = [];
                    }
                    if(roots[map[node.parent]]['children']){
                        roots[map[node.parent]]['children'].push(obj);
                    }
                }
            } else {
                let obj = {
                    text: this.langResource[node.menuname] ? this.langResource[node.menuname] : node.title,
                    value: node._id,
                    checked: false,
                    materialicon: node.materialicon,
                    shortname: node.shortname,
                    url: node.url,
                    menuname: node.menuname,
                };
                roots.push(obj);
            }
        }
        return roots;
    }


    getNData(){
        //this.getTaskListsByLoginID();
    }

    getipath(){
        this.isLoadLogo = true;
        this.companySettingService
            .GetAll()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data:any)=>{
                if(data) {
                    if(data[0] != undefined && data[0]['databasetype'] != undefined && data[0]['databasetype'] == 'branchwise') {
                        if(this.authService.auth_user != undefined && this.authService.auth_user.branchid != undefined &&  this.authService.auth_user.branchid._id != undefined){
                            let bindId = this.authService.auth_user.branchid._id;
                            this._branchesService.GetById(bindId).subscribe(
                                (data58: any) => {
                                    if(data58 && data58.branchlogo != undefined){
                                        this.logoPath = data58.branchlogo;
                                        this.isLoadLogo = false;
                                    } else {
                                        this.isLoadLogo = false;
                                        if(data[0] != undefined && data[0]['logo']) {
                                            this.logoPath = data[0]['logo'];
                                            this.isLoadLogo = false;
                                        }
                                    }
                                }, data75 => {
                                    this.isLoadLogo = false;
                                    if(data[0] != undefined && data[0]['logo']) {
                                        this.logoPath = data[0]['logo'];
                                        this.isLoadLogo = false;
                                    }
                                });
                        } else {
                            this.isLoadLogo = false;
                            if(data[0] != undefined && data[0]['logo']) {
                                this.logoPath = data[0]['logo'];
                                this.isLoadLogo = false;
                            }
                        }

                    } else if(data[0] != undefined && data[0]['logo']) {
                        this.logoPath = data[0]['logo'];
                        this.isLoadLogo = false;
                    } else {
                        this.isLoadLogo = false;
                    }

                }
                this.isLoadLogo = false;
            }, data => {
                this.isLoadLogo = false;
            });
    }

    logout() {
        const roleType = this.authService.auth_roletype;
        this.authService.logout();
        if(roleType !== 'M') {
          this._router.navigate(['login']);
        } else if(roleType === 'M') {
          this._router.navigate(['loginMember']);
        } else {
          this._router.navigate(['login']);
        }
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

    gotoMysettings() {
        const roleType = this.authService.auth_roletype;
        const loginUserId = this.authService.auth_id;
        if(roleType !== 'M') {
           this._router.navigate(['pages/admins/admin-settings']);
           //this._router.navigate(['pages/usersmembers-settings']);
        } else if(roleType == 'M') {
           this._router.navigate(['pages/members/members-settings']);
           //this._router.navigate(['pages/usersmembers-settings']);
        } else {
          this._router.navigate(['login']);
        }
    }

    gotoMyprofile() {
        const roleType = this.authService.auth_roletype;
        const loginUserId = this.authService.auth_id;
        if(roleType !== 'M') {
           this._router.navigate(['/pages/dynamic-forms/view/' + '/' + loginUserId ]);
        } else if(roleType === 'M') {
          if(loginUserId != undefined && loginUserId != '') {
            this._router.navigate(['/pages/dynamic-forms/view/' + '/' + loginUserId ]);
          }
        } else {
          this._router.navigate(['login']);
        }
    }

    goToLink(url : string){
        window.open('//'+url, "_blank");
    }

    isNotMobileMenu(){
        if($(window).width() > 991){
            return false;
        }
        return true;
    }


    isMobileMenu() {
        if ($(window).width() > 991) {
            return false;
        }
        return true;
    };


    updatePS(): void  {
        if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
            this.ps.update();
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
