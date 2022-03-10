import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CommonService } from '../../core/services/common/common.service';
import { CommonDataService } from '../../core/services/common/common-data.service';

import { AuthService } from '../../core/services/common/auth.service';
import { LangresourceService } from '../../core/services/langresource/langresource.service';
import { RoleService } from '../../core/services/role/role.service';

import { FormdataService } from '../../core/services/formdata/formdata.service';

declare var $: any;
import swal from 'sweetalert2';

@Component({
    selector: 'app-dynamictab',
    templateUrl: './dynamictab.component.html'
})

export class DynamictabComponent implements OnInit {

    currentuserroletype: boolean = true;
    currentloginId: any;
 
    langResource: any;
    defaultLanguage: any;

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        private _commonService: CommonService,
        private _commonDataService: CommonDataService,
        private _authService: AuthService,
        private _langresourceService: LangresourceService,
        private _roleService: RoleService,
        private _formdataService: FormdataService
    ) { 
        this._authService.isLoggedIn();
    }

    @Input('formObj') formObjValue: any;
    @Input('activeTab') activeTabValue: string;
    @Input('isLoadTabs') isLoadTabsValue: boolean;
    @Input('isLoadPermission') isLoadPermissionValue: boolean;
    @Input('bindId') bindIdValue: string;

    @Input('classid') classidValue: string;
    @Input('courseid') courseidValue: string;

    @Input('viewVisibility') viewVisibilityValue: boolean;
    @Input('isedit') iseditValue: boolean = true;

    @Input('tabList') tabListValue: any[] = [];
    @Input('displaytabnamebycalendar') displaytabnamebycalendarValue: any[] = [];

    @Input('tabpermission') tabpermissionValue: any[] = [];
    @Input('formId') formIdValue: string;
    @Input('formName') formNameValue: string;
    @Input('rolename') rolenameValue: string;
    @Output() onPermissionLoadData: EventEmitter<any> = new EventEmitter<any>();

    ngOnInit() {

        this.defaultLanguage = 'ENG';
        this.defaultLanguage = this._authService.auth_language;
         
        this.loadLangResource("dynamic-form");
        this.langResource = {};

        if (this._authService.auth_role['roletype'] == "M") {
        
            if (this.formObjValue && this.formObjValue['formname'] && this.formObjValue['formname'] !== 'memberbooking' && this.formObjValue['formname'] !== 'facilitybooking' && this.formObjValue['formname'] !== 'course-detail-member') {
                this.currentuserroletype = false;
            }
        }

        this.currentloginId = this._authService.auth_id

        this.tabpermissionValue = [];
        this.rolenameValue = this._authService.auth_role['rolename'];

        if (this.formObjValue != undefined) {
            if (this.formObjValue.formname != undefined) {
                this.getPermissionByForm(this.formObjValue.formname, this.rolenameValue);
            }
            if (this.formObjValue.tabs != undefined && this.formObjValue.tabs.length > 0) {
                this.tabListValue = this.formObjValue.tabs;
                this.tabListValue.forEach(ele => {
                    ele.isPermission = false;
                    if(ele.pageurl != undefined){

                        if (ele.pageurl.includes('/pages/dynamic-survey-forms/context-form/')) {
                            if (this.bindIdValue != undefined) {
                                let postData = {};
                                postData['search'] = [];
                                postData['search'].push({ "searchfield": "objectid" , "searchvalue": this.bindIdValue, "criteria": "eq"})                                
                                
                                this._formdataService
                                    .GetByfilter(postData)
                                        .subscribe((data: any) =>{
                                            if(data && data.length !=0 && data[0] && data[0]._id){
                                                ele.pageurl = ele.pageurl.replace(':_formdataid',data[0]._id);
                                            } else {
                                                ele.pageurl = ele.pageurl.replace(':_formdataid','');
                                            }
                                        });
                            } 
                        }

                        if (this.courseidValue != undefined) {
                            ele.pageurl = ele.pageurl.replace(':_courseid', this.courseidValue);
                        }

                        if (this.classidValue != undefined) {
                            ele.pageurl = ele.pageurl.replace(':_classid', this.classidValue);
                        }

                        if (this.formObjValue._id != undefined) {
                            ele.pageurl = ele.pageurl.replace(':_formid', this.formObjValue._id);
                        } else {
                            ele.pageurl = ele.pageurl.replace(':_formid', '');
                        }
                        if (this.bindIdValue != undefined) {
                            ele.pageurl = ele.pageurl.replace(':_id', this.bindIdValue);
                        } else {
                            ele.pageurl = ele.pageurl.replace(':_id', '');
                        }

                        
                    }
                    ele.isedit = this.iseditValue;
                });
                this.tabListValue = this.tabListValue.sort((n1, n2) => { if (n1.displayOrder > n2.displayOrder) { return 1; } if (n1.displayOrder < n2.displayOrder) { return -1; } return 0; });
                this.isLoadTabsValue = false;
            }

        } else {
            this.tabListValue.forEach(ele => {
                ele.isPermission = false;
                if (ele.pageurl != undefined) {
                    if (ele.pageurl.includes('/pages/dynamic-survey-forms/context-form/')) {
                        if (this.bindIdValue != undefined) {
                            let postData = {};
                            postData['search'] = [];
                            postData['search'].push({ "searchfield": "objectid", "searchvalue": this.bindIdValue, "criteria": "eq" })

                            this._formdataService
                                .GetByfilter(postData)
                                .subscribe((data: any) => {
                                    if (data && data.length != 0) {
                                        ele.pageurl = ele.pageurl.replace(':_formdataid', data[0]._id);
                                    } else {
                                        ele.pageurl = ele.pageurl.replace(':_formdataid', '');
                                    }
                                });
                        }
                    }
                    if (this.formIdValue != undefined) {
                        ele.pageurl = ele.pageurl.replace(':_formid', this.formIdValue);
                    } else {
                        ele.pageurl = ele.pageurl.replace(':_formid', '');
                    }
                    if (this.bindIdValue != undefined) {
                        ele.pageurl = ele.pageurl.replace(':_id', this.bindIdValue);
                    } else {
                        ele.pageurl = ele.pageurl.replace(':_id', '');
                    }
                }
                ele.isedit = this.iseditValue;
            });
            this.tabListValue = this.tabListValue.sort((n1, n2) => { if (n1.displayOrder > n2.displayOrder) { return 1; } if (n1.displayOrder < n2.displayOrder) { return -1; } return 0; });
            this.isLoadTabsValue = false;
        }
    }

    loadLangResource(pageName: any) {
        let postData = {};
        postData['search'] = [];
        postData['search'].push({ 'searchfield': 'pagename', 'searchvalue': pageName, 'criteria': 'lk' });
        this._langresourceService
            .GetByFilter(postData)
            .subscribe((data: any) => {
                if (data && data.length !== 0) {
                    this.langResource = {};
                    data.forEach(element => {
                        if (element.key && element.value) {
                            this.langResource[element.key] = [];
                            this.langResource[element.key] = element['value'][this.defaultLanguage] ? element['value'][this.defaultLanguage] : element.key;
                        }
                    });
                }
            });
    }

    getPermissionByForm(formname: string, rolename: string) {
        this.isLoadPermissionValue = true;
        this.tabpermissionValue = [];

        let data = {
            rolename: rolename,
            formname: formname
        };
        this._roleService
            .GetPermissionBasedOnRoleAndForm(data)
            .subscribe(data => {
                if (data[0] != undefined) {

                    this.isLoadPermissionValue = false;

                    if (data[0]['permissions'] != undefined && data[0]['permissions']['tabpermission'] != undefined) {
                        this.tabpermissionValue = data[0]['permissions']['tabpermission'];
                    } else {
                        this.viewVisibilityValue = false;
                        this.onPermissionLoadData.emit({ viewVisibility: this.viewVisibilityValue, isLoadPermission: this.isLoadPermissionValue });
                    }

                    if(this.tabpermissionValue && this.tabpermissionValue.length !== 0 && this.tabListValue && this.tabListValue.length !== 0) {
                        this.tabListValue.forEach(element => {
                            this.tabpermissionValue.forEach(ele => {
                                if(element.tabkey == ele) {
                                    element.isPermission = true;
                                }
                            });
                        });
                    }

                    if (this.tabpermissionValue.length > 0) {
                        let pre = this.tabpermissionValue.findIndex(ele => ele == this.activeTabValue);
                        if (pre == -1) {
                            this.viewVisibilityValue = false;
                            this.onPermissionLoadData.emit({ viewVisibility: this.viewVisibilityValue, isLoadPermission: this.isLoadPermissionValue });
                        } else {
                            this.viewVisibilityValue = true;
                            this.onPermissionLoadData.emit({ viewVisibility: this.viewVisibilityValue, isLoadPermission: this.isLoadPermissionValue });
                        }
                    } else {
                        this.viewVisibilityValue = true;
                        this.onPermissionLoadData.emit({ viewVisibility: this.viewVisibilityValue, isLoadPermission: this.isLoadPermissionValue });
                    }

                } else {
                    this.isLoadPermissionValue = false;
                    this.onPermissionLoadData.emit({ viewVisibility: this.viewVisibilityValue, isLoadPermission: this.isLoadPermissionValue });

                }
            }, data => {
                this.isLoadPermissionValue = false;
                this.onPermissionLoadData.emit({ viewVisibility: this.viewVisibilityValue, isLoadPermission: this.isLoadPermissionValue });
            });
    }

    jsUcfirst(string: any) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    showNotification(from: any, align: any, msg: any, type: any) {
        $.notify({
            icon: "notifications",
            message: msg
        }, {
                type: type,
                timer: 3000,
                placement: {
                    from: from,
                    align: align
                }
            });
    }

    closePopup() {
        $('.show-dropdown').removeClass('open');
    }

    public tabClickFun(val: any) {

        if (this.bindIdValue || this.classidValue) {
            this._commonDataService.isfilterDataForDynamicPages = true;

            let searchvalue = val.searchvalue.replace(':_id', this.classidValue ? this.classidValue : this.bindIdValue);
            
            let searchvalueCurrentLogin;
            if (this._authService.auth_role['roletype'] == "M") {
                searchvalueCurrentLogin = val.searchvalue.replace(':_currentloginid', this.currentloginId);
            } else {
                searchvalueCurrentLogin = val.searchvalue.replace(':_currentloginid', this.classidValue ? this.classidValue : this.bindIdValue);
            }

            this._commonDataService.filterDataForDynamicPagesparams['tabname'] = '';
            this._commonDataService.filterDataForDynamicPagesparams['tabname'] = val.tabname;

            this._commonDataService.filterDataForDynamicPagesparams['searchtype'] = '';
            this._commonDataService.filterDataForDynamicPagesparams['searchtype'] = val.searchtype;

            this._commonDataService.filterDataForDynamicPagesparams['search'] = [];
            this._commonDataService.filterDataForDynamicPagesparams['search'].push({ "searchfield": val.searchfield, "searchvalue": searchvalueCurrentLogin && searchvalueCurrentLogin !== ':_id' ? searchvalueCurrentLogin : searchvalue, "criteria": "eq" });

            let redirectUrlforTab = val.pageurl.replace(':_id', searchvalueCurrentLogin && searchvalueCurrentLogin !== ':_id' ? searchvalueCurrentLogin : searchvalue);


            this._commonDataService.filterDataForDynamicPagesparams['returnURl'] = '';
            this._commonDataService.filterDataForDynamicPagesparams['returnURl'] = redirectUrlforTab;

            if(this.classidValue && this.courseidValue) {
                this._router.navigate([redirectUrlforTab + '/' + this.courseidValue + '/'+ this.classidValue]);
            } else {
                this._router.navigate([redirectUrlforTab]);
            }

            

        }
    }

}
