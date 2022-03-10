import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Subject } from 'rxjs';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from '@angular/cdk/collections';

import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { CommonDataService } from '../../../../core/services/common/common-data.service';

import swal from 'sweetalert2';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html'
})
export class MemberProfileComponent extends BaseComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  _formId: string;

  dataContent: any = {};
  reloadingStr: string = "";

  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  membershipLists: any[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();

  profileVisibility: boolean = true;
  timelineVisibility: boolean = false;
  communicationVisibility: boolean = false;
  walletVisibility: boolean = false;
  activitylogVisibility: boolean = false;

  actionselected: any;

  tabPermission: any[] = [];
  functionPermission: any[] = [];

  communicationMailalertList: any[] = [];

  disablesubmit = false;
  submitted: boolean;

  freezeForm: FormGroup;
  freezeSubmitted: boolean;

  changeMembershipForm: FormGroup;
  changeMembershipSubmitted: boolean;

  renewMembershipForm: FormGroup;
  renewMembershipSubmitted: boolean;

  freezeAction: string;
  freezemembershipend: Date;
  freezetoday: boolean = false;

  membershipstart: Date;
  membershipend: Date;

  form_fields = {
    "fieldname": "membershipid",
    "fieldtype": "form",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "property.type", "searchvalue": false, "criteria": "exists" },
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "membershipname", "value": 1 },
      { "fieldname": "property", "value": 1 },
    ],
    "form": {
      "apiurl": "memberships/filter",
      "formfield": "_id",
      "displayvalue": "membershipname",
    },
    "method": "POST",
    "dbvalue": {}
  }

  membershipid: any;

  displayedColumns: string[] = ['item', 'title', 'period', 'tenure', 'amount', 'discount', 'taxamount', 'totalamount', 'action'];
  //dataSource: any [] = [];

  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource;
  selection = new SelectionModel;

  sendMessageVisibility: boolean = false;

  defaultWalletPage: boolean = false;
  isWalletEnable: boolean = false;

  panelOpenState: boolean = false;
  activityPanel: string[] = [];

  isLoadingPU: boolean = false;
  allData: any;
  mydriveData: any[] = [];
  disableBtn: boolean = false;


  templates: any[] = [];

  templatedisplayedColumns: string[] = ['select', 'name', 'createdAt', 'addedby'];
  TEMPLATE_ELEMENT_DATA: any[] = [];
  templatedataSource = new MatTableDataSource;
  @ViewChild(MatPaginator, { static: false }) templatepaginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) templatesort: MatSort = {} as MatSort;


  documentdisplayedColumns: string[] = ['select', 'name', 'size', 'createdAt', 'addedby'];
  DOCUMENT_ELEMENT_DATA: any[] = [];
  documentdataSource = new MatTableDataSource;
  @ViewChild(MatPaginator, { static: false }) documentpaginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) documentsort: MatSort = {} as MatSort;


  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort = {} as MatSort;


  formdataLists: any[] = [];

  constructor(
    private fb: FormBuilder,
    private _route: ActivatedRoute,
    private _commonDataService: CommonDataService,
  ) {

    super();
    this.pagename = "app-member-profile";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "599673a925f548d7dbbd7c86";
      this.contentVisibility = false;
      this.itemVisbility = false;
    })

    this.freezeForm = fb.group({
      'freezemembershipend': [this.freezemembershipend, Validators.required],
      'freezetoday': [this.freezetoday],
    });

    this.changeMembershipForm = fb.group({
      'changeMembershipStartDate': [, Validators.required],
      'changeMembershipEndDate': [, Validators.required],
    });

    this.renewMembershipForm = fb.group({
      'membershipid': [this.membershipid, Validators.required],
      'membershipstart': [this.membershipstart, Validators.required],
      'membershipend': [this.membershipend, Validators.required],
    });


  }

  async ngOnInit() {

    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.initializeVariables();
        await this.LoadData();
        await this.loadFormDatas()
      } catch (err) {
        console.error(err);
      } finally {
        if (this.defaultWalletPage == true) {
          this.walletClick();
        }
      }
    });

    this.freezeForm.get('freezetoday')
      .valueChanges
      .subscribe((bol: boolean) => {
        this.freezeForm.controls['freezemembershipend'].setValue(null);
        this.freezeForm.controls['freezemembershipend'].enable();
        if (bol) {
          this.freezeForm.controls['freezemembershipend'].setValue(new Date());
          this.freezeForm.controls['freezemembershipend'].disable();
        }
      });
  }

  async initializeVariables() {

    this.dataContent = {};
    this.contentVisibility = false;
    this.membershipLists = [];
    this.tabPermission = [];
    this.contentVisibility = false;
    this.profileVisibility = false;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    this.walletVisibility = false;
    this.freezeAction = "";
    this.actionselected = "profile";
    this.sendMessageVisibility = false;
    this.form_fields.dbvalue = {};

    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;
      }
      var permissionObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)

      if (permissionObj && permissionObj.functionpermission) {
        this.functionPermission = permissionObj.functionpermission;
      }
    }

    if (this._authService.auth_user && this._authService.auth_user.branchid && this._authService.auth_user.branchid._id) {
      this.isWalletEnable = this._authService.auth_user.branchid.iswalletenable ? this._authService.auth_user.branchid.iswalletenable : false;
    }

    this.panelOpenState = false;
    this.isLoadingPU = false;

    this.mydriveData = [];
    this.templates = [];
    this.formdataLists = [];

    this.activityPanel = [];
    if (this.formObj.functions.length > 0) {
      const functions = this.formObj.functions.find(a => a.functionname == 'Activity Panel');
      if (functions.functions && functions.functions.length > 0) {
        this.activityPanel = functions.functions;
      }
    }
    return;
  }

  Save() { }
  Update() { }
  Delete() { }
  ActionCall() { }

  async LoadData() {


    let method = "POST";
    let url = "members/filter/view";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });
    this.form_fields.dbvalue = this.dataContent.membershipid;

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          // console.log("data", data);
          this.dataContent = data[0];
          this.form_fields.dbvalue = {};
          if (this.dataContent.membershipid) {
            this.form_fields.dbvalue = this.dataContent.membershipid;
          }

          this.freezeForm.controls['freezemembershipend'].setValue(null);
          if (this.dataContent.property && this.dataContent.property.freezedate) {
            this.freezeForm.controls['freezemembershipend'].setValue(new Date(this.dataContent.property.freezedate));
          }

          this.contentVisibility = true;
          this.itemVisbility = true;

          this.profileVisibility = true;
          this.timelineVisibility = false;
          this.communicationVisibility = false;
          this.activitylogVisibility = false;

          return;
        }
      }, (error) => {
        console.error(error);
      })
  }

  async loadFormDatas() {

    let method = "POST";
    let url = "formdatas/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "property.shared", "searchvalue": true, "criteria": "exists", "datatype": "boolean" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        if (data && data[0]) {
          this.formdataLists = [];
          this.formdataLists = data;
          return;
        }
      }, (error) => {
        console.error(error);
      })

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getSubmittedNotesData(submitData: any) {
    this.ngOnInit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  getSubmittedOpenActivityData(submitData: any) {

    if (submitData && submitData.panelOpenState && submitData.panelOpenState == true) {
      if (this.panelOpenState) {
        this.panelOpenState = false;
      }
      setTimeout(() => {
        this.panelOpenState = true;
        this.actionselected = "activitylog";
        this.buttonToggle('activitylog')
      });
    } else {
      this.ngOnInit();
    }
  }

  getSubmittedCloseActivityData(submitData: any) {

    if (submitData && submitData.panelOpenState && submitData.panelOpenState == true) {

      if (this.panelOpenState) {
        this.panelOpenState = false;
      }
      setTimeout(() => {
        this.panelOpenState = true;
        this.actionselected = "activitylog";
        this.buttonToggle('activitylog')
      });
    } else {

      this.ngOnInit();
    }
  }

  getSubmittedAppointmentData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedScheduleData(submitData: any) {
    if (submitData) {
      this.reloadingStr = submitData.tabStr;
      this.LoadData();
    }
    // this.ngOnInit();
  }

  getSubmittedAttachmentData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  getSubmittedAssetScheduleData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedDynamicData(submitData: any) {
    // this.ngOnInit();
    if (submitData) {
      this.reloadingStr = submitData.tabStr;
      this.LoadData();
    }
  }

  onCloseResendData(submitData: any) {
    // console.log("onResendCommunication called");
    this.ngOnInit();
    setTimeout(() => {
      this.buttonToggle('communication')
      this.actionselected = "communication"
    }, 1000);

  }

  getSubmittedCloseMessageData(submitData: any) {
    $("#closeform").click();
  }

  getSubmittedData(submitData: any) {
    this._router.navigate([`/pages/payment-module/multiple-payment/${submitData.memberid}/${submitData.membershipid}`]);
    // this.ngOnInit();
  }

  getSubmittedWeekScheduleData(submitData: any) {
    this.ngOnInit();
  }

  getSubmittedIssueCardData(submitData: any) {
    this.defaultWalletPage = true;
    this.ngOnInit();
  }

  redirectUrl(submittedData: any) {
    if (submittedData) {
      this._commonDataService.isfilterDataForDynamicPages = true;
      this._commonDataService.filterDataForDynamicPagesparams['returnURl'] = '';
      this._commonDataService.filterDataForDynamicPagesparams['returnURl'] = "/pages/members/profile/" + this.dataContent._id;
      this._router.navigate(["/pages/dynamic-forms/form/" + submittedData.formid + '/' + this.dataContent._id + '/Member']);
    }
  }

  buttonToggle(type: string) {
    if (type == "profile") {
      this.profileVisibility = true;
      this.timelineVisibility = false;
      this.communicationVisibility = false;
      this.walletVisibility = false;
      this.activitylogVisibility = false;
    } else if (type == "timeline") {
      this.profileVisibility = false;
      this.timelineVisibility = true;
      this.communicationVisibility = false;
      this.walletVisibility = false;
      this.activitylogVisibility = false;
    } else if (type == "communication") {
      this.profileVisibility = false;
      this.timelineVisibility = false;
      this.communicationVisibility = true;
      this.walletVisibility = false;
      this.activitylogVisibility = false;
    } else if (type == "activitylog") {
      this.profileVisibility = false;
      this.timelineVisibility = false;
      this.communicationVisibility = false;
      this.activitylogVisibility = true;
    }
  }

  async sendMessage() {
    this.sendMessageVisibility = true;
  }

  freezeUnfreezeClick(action: any) {
    this.freezeAction = action;
    this.freezeSubmitted = false;
  }

  async onFreezeSubmit(value: any, isValid: boolean) {

    this.freezeSubmitted = true;

    if (!isValid) {
      return false;
    } else {

      let method = "PATCH";
      let url = "members/" + this.dataContent._id;
      var value = this.freezeForm.getRawValue();

      let postData = {};
      postData["property"] = {};
      postData["property"] = this.dataContent.property;
      postData["property"]['freezedate'] = null;
      if (value.freezetoday) {
        postData["status"] = this.freezeAction.toLowerCase();
      }
      if (this.freezeAction.toLowerCase() == 'freeze') {
        postData["property"]['freezedate'] = value.freezemembershipend && value.freezemembershipend._d ? value.freezemembershipend._d : value.freezemembershipend;
      }

      this.disablesubmit = true;
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then(data => {
          if (data) {
            $("#closeFreezeform").click();
            this.freezeSubmitted = false;
            this.freezeForm.reset();
            this.showNotification('top', 'right', `Membership has been ${this.freezeAction} successfully!!!`, 'success');
            this.disablesubmit = false;
            this.ngOnInit();
          }
        }).catch((error) => {
          this.disablesubmit = false;
          console.error(error);
        })
    }
  }


  membershipStartDateValueChange(event: any) {

    if (event) {

      this.membershipstart = new Date(this.changeMembershipForm.get("changeMembershipStartDate").value);
      var newDate = new Date(this.membershipstart);
      if (this.membershipstart != undefined && this.membershipstart != null) {

        if (this.dataContent.membershipid._id == undefined) {
          this.showNotification('top', 'right', 'Something Went Wrong!!!', 'danger');
          return;
        } else {
          if (this.dataContent.membershipid.periodin != undefined) {
            if (this.dataContent.membershipid.periodin == "Year") {
              newDate.setFullYear(this.membershipstart.getFullYear() + this.dataContent.membershipid.tenure)
            }
            if (this.dataContent.membershipid.periodin == "Month") {
              var endDateMoment = moment(newDate);                               // ADDED
              endDateMoment.add(this.dataContent.membershipid.tenure, 'months'); // ADDED
              newDate = endDateMoment.toDate();                                  // ADDED
              // newDate.setMonth(this.membershipstart.getMonth() + this.dataContent.membershipid.tenure)
            }
          } else if (this.dataContent.membershipid.property != undefined && this.dataContent.membershipid.property.tenure_month != undefined) {
            let monthinc: number = 0;
            let ten: number = this.dataContent.membershipid.property.tenure_month;
            monthinc += Number(ten);
            let selectedten: number = this.membershipstart.getMonth();
            monthinc += Number(selectedten);
            // newDate.setMonth(monthinc);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
          } else if (this.dataContent.membershipid.property != undefined && this.dataContent.membershipid.property.tenure_year != undefined) {
            let yearinc: number = 0;
            let ten: number = this.dataContent.membershipid.property.tenure_year;
            yearinc += Number(ten);
            let selectedten: number = this.membershipstart.getFullYear();
            yearinc += Number(selectedten);
            newDate.setFullYear(yearinc);
          } else if (this.dataContent.membershipid.property && this.dataContent.membershipid.property.tenure) {
            let monthinc: number = 0;
            let ten: number = this.dataContent.membershipid.property.tenure;
            monthinc += Number(ten);
            let selectedten: number = this.membershipstart.getMonth();
            monthinc += Number(selectedten);
            // newDate.setMonth(monthinc);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
          }
          newDate.setDate(this.membershipstart.getDate() - 1);
          this.changeMembershipForm.get('changeMembershipEndDate').setValue(newDate);
        }
      }
    }

  }

  changeMembershipDate() {
    this.changeMembershipForm.get("changeMembershipStartDate").setValue(new Date(this.dataContent.membershipstart))
    this.changeMembershipForm.get("changeMembershipEndDate").setValue(new Date(this.dataContent.membershipend))
  }

  async getSubmittedAssetData(submitData: any) {
    this.ngOnInit();
  }

  async onChangeMembershipDateSubmit(value: any, isValid: boolean) {
    this.changeMembershipSubmitted = true;

    if (!isValid) {
      this.showNotification('top', 'right', `Validation failed !!`, 'danger');
      return;
    } else {
      let method = "PATCH";
      let url = "members/" + this.dataContent._id;

      let postData = {};
      postData["membershipstart"] = new Date(value.changeMembershipStartDate);
      postData["membershipend"] = new Date(value.changeMembershipEndDate);

      this.disablesubmit = true;
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data) => {
          if (data) {
            this.disablesubmit = false;
            $("#closecmd").click();
            this.changeMembershipSubmitted = true;
            this.changeMembershipForm.reset();
            this.showNotification('top', 'right', `Membership Date has been Change successfully!!!`, 'success');
            setTimeout(() => {
              this.ngOnInit();
            }, 200);
          }
        }).catch((error) => {
          this.disablesubmit = false;
          $("#closecmd").click();
          console.error(error);
        })
    }
  }

  walletClick() {
    this.actionselected = undefined;
    this.profileVisibility = false;
    this.timelineVisibility = false;
    this.communicationVisibility = false;
    this.activitylogVisibility = false;
    this.walletVisibility = true;
    this.defaultWalletPage = false;
  }

  refundClick() {
    this._router.navigate(['/pages/payment-module/refund/mode/membership-refund/' + this.bindId])
  }

  usageClick() {
    this._router.navigate(['/pages/members/membership-usage-summary/' + this.bindId]);
  }

  cancelMembership() {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure want to Cancel Membership?',
      text: 'You will not be able to recover this!!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {


        let method = "PATCH";
        let url = "members/" + varTemp.dataContent._id;

        let postData = {};
        postData["status"] = "Cancelled";

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, postData)
          .then(data => {
            if (data) {
              varTemp.showNotification('top', 'right', `Membership has been Cancelled successfully!!!`, 'success');
              varTemp._router.navigate(['/pages/dynamic-list/list/' + varTemp._formName]);
              return;
            }
          }, (error) => {
            console.error(error);
          })



      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your Membership is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

  async assigMembership() {
    this.renewMembershipSubmitted = false;
    if (this.dataContent && this.dataContent.membershipid) {
      await this.inputModelChangeValue(this.dataContent.membershipid);
      this.renewMembershipForm.get('membershipstart').setValue(moment(new Date()));
      this.ChangeDate(this.renewMembershipForm.get('membershipstart').value);
    }
  }

  async onRenewMembershipeSubmit(value: any, isValid: boolean) {
    this.renewMembershipSubmitted = true;
    if (!isValid) {
      return false;
    } else {

      if (this.selection.selected.length == 0) {
        this.showNotification('top', 'right', 'Please select payment terms!!!', 'danger');
        return;
      }

      let method = "POST";
      let url = "members/updatemembership";

      let postData = {};
      postData["paymentterms"] = []
      this.selection.selected.forEach(element => {
        if (element['_id']) {
          postData["paymentterms"].push(element['_id']);
        }
      });
      postData["membershipid"] = value.membershipid._id;
      postData["membershipstart"] = value.membershipstart;
      postData["membershipend"] = value.membershipend;
      postData["_id"] = this.dataContent._id;

      this.disablesubmit = true;
      await this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            this.disablesubmit = false;
            $("#closeRenewMembership").click();
            this.renewMembershipSubmitted = true;
            this.renewMembershipForm.reset();
            this.showNotification('top', 'right', `Membership has been updated successfully !!`, 'success');
            if (data.memberid && data.membershipid) {
              this._router.navigate([`/pages/payment-module/multiple-payment/${data.memberid}/${data.membershipid}`]);
            } else if (data.memberid) {
              this._router.navigate([`/pages/payment-module/multiple-payment/${data.memberid}`]);
            } else {
              this.ngOnInit();
            }
          }
        }).catch((error) => {
          this.disablesubmit = false;
          console.error(error);
        })


    }
  }

  async inputModelChangeValue(value: any) {
    if (value && value._id) {
      this.membershipid = value;
      await this.getPaymentTerms()
    } else {
      this.membershipid = null;
      this.dataSource = new MatTableDataSource();
    }
  }


  async getPaymentTerms() {

    let method = "POST";
    let url = "paymentterms/filter";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membershipid", "searchvalue": this.membershipid._id, "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.dataSource = data;
          data.forEach(elePaymentTerms => {
            elePaymentTerms['payment'] = false;
            let amount = elePaymentTerms.amount;
            if (elePaymentTerms.discount != undefined && elePaymentTerms.discount != 0) {
              amount -= elePaymentTerms.discount;
            }
            elePaymentTerms.taxamount = 0;
            elePaymentTerms.totalamount = 0;
            if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
              elePaymentTerms.taxamount = this._commonService.calTaxes(elePaymentTerms.taxes, amount);
            }
            elePaymentTerms.totalamount = amount + elePaymentTerms.taxamount;
            elePaymentTerms.isedit = false;
          });

          this.dataSource = new MatTableDataSource();
          this.dataSource = new MatTableDataSource(data);
          this.selection = new SelectionModel(true, []);
          this.dataSource.sort = this.sort;

        }
      }, (error) => {
        console.error(error);

      })
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  ChangeDate(event: any) {
    if (!this.membershipid) {
      this.showNotification('top', 'right', 'Please choose any membership', 'danger');
      return;
    }
    if (event) {
      this.membershipstart = event['_d'];
      this.renewMembershipForm.get('membershipstart').setValue(this.membershipstart);
      var newDate = new Date(this.membershipstart);
      if (this.membershipstart != undefined && this.membershipstart != null) {
        if (this.membershipid.autocomplete_id == undefined) {
          this.showNotification('top', 'right', 'Please choose any membership', 'danger');
          return;
        } else {
          if (this.membershipid.periodin != undefined) {
            if (this.membershipid.periodin == "Year") {
              newDate.setFullYear(this.membershipstart.getFullYear() + this.membershipid.tenure)
            }
            if (this.membershipid.periodin == "Month") {
              var endDateMoment = moment(newDate);                               // ADDED
              endDateMoment.add(this.membershipid.tenure, 'months');             // ADDED
              newDate = endDateMoment.toDate();                                  // ADDED
              // newDate.setMonth(this.membershipstart.getMonth() + this.membershipid.tenure)
            }
          } else if (this.membershipid.property != undefined && this.membershipid.property.tenure_month != undefined) {
            let monthinc: number = 0;
            let ten: number = this.membershipid.property.tenure_month;
            monthinc += Number(ten);
            let selectedten: number = this.membershipstart.getMonth();
            monthinc += Number(selectedten);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
            // newDate.setMonth(monthinc);
          } else if (this.membershipid.property != undefined && this.membershipid.property.tenure_year != undefined) {
            let yearinc: number = 0;
            let ten: number = this.membershipid.property.tenure_year;
            yearinc += Number(ten);
            let selectedten: number = this.membershipstart.getFullYear();
            yearinc += Number(selectedten);
            newDate.setFullYear(yearinc);
          } else if (this.membershipid.property && this.membershipid.property.tenure) {
            let monthinc: number = 0;
            let ten: number = this.membershipid.property.tenure;
            monthinc += Number(ten);
            let selectedten: number = this.membershipstart.getMonth();
            monthinc += Number(selectedten);
            var endDateMoment = moment(newDate);         // ADDED
            endDateMoment.add(ten, 'months');            // ADDED
            newDate = endDateMoment.toDate();            // ADDED
            // newDate.setMonth(monthinc);
          }
          newDate.setDate(this.membershipstart.getDate() - 1);
          this.renewMembershipForm.get('membershipend').setValue(newDate);
        }
      }
    }
  }

  async getMyTemplate() {

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "formtype", "searchvalue": "document", "criteria": "eq" });

    this.isLoadingPU = true;

    var method = "POST";
    var url = "forms/filter";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {

        this.isLoadingPU = false;

        if (data && data.length > 0) {
          this.templates = [];
          this.templates = data;
        }
      }).catch((error) => {
        console.error(error);
      });

    await this.setTemplateData();
  }

  async setTemplateData() {

    this.TEMPLATE_ELEMENT_DATA = [];
    // console.log("this.formdataLists", this.formdataLists)
    if (this.templates && this.templates.length > 0) {
      this.templates.forEach(element => {

        let formdataid: any;
        var formdataObj = this.formdataLists.find(p => p?.formid?._id == element._id);

        if (formdataObj) {
          formdataid = formdataObj;
        }

        let obj = {
          checked: formdataid && formdataid.property && formdataid.property.shared && formdataid.property.shared.length > 0 ? formdataid.property.shared.includes(this.bindId) : false,
          createdAt: element?.createdAt,
          addedby: element?.addedby,
          _id: formdataid?._id,
          name: element.dispalyformname,
          formid: element._id,
          path: element?.path,
          shared: formdataid?.property?.shared
        }
        this.TEMPLATE_ELEMENT_DATA.push(obj);
      });



    }
    this.templatedataSource = new MatTableDataSource();
    this.templatedataSource = new MatTableDataSource(this.TEMPLATE_ELEMENT_DATA);
    this.templatedataSource.paginator = this.templatepaginator;
    this.templatedataSource.sort = this.templatesort;

  }

  async saveSharedTemplate() {

    this.disableBtn = true;
    this.TEMPLATE_ELEMENT_DATA.forEach(async (doc, ind) => {

      if (!doc.shared) {
        doc.shared = [];
      }

      if (doc.checked) {
        var fnd = doc.shared.find((a) => a == this.bindId);
        if (!fnd) {
          doc.shared.push(this.bindId);
        }
      } else {
        var fnd = doc.shared.find((a) => a == this.bindId);
        if (fnd) {
          var i = doc.shared.findIndex((i) => i == this.bindId);
          doc.shared.splice(i, 1);
        }
      }

      if (doc.shared && doc.shared.length > 0) {


        if (doc._id) {

          var method = "PUT";
          var url = "formdatas";

          let postData = {};
          var formdataObj = this.formdataLists.find(p => p._id == doc._id);

          if (formdataObj) {
            postData = { ...formdataObj };
          }

          postData["property"]["shared"] = [];
          postData["property"]["shared"] = doc.shared;



          this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, postData, doc._id)
            .then((data: any) => {
              if (data) {
              }
            }).catch((error) => {
              console.error(error);
            });

        } else {

          var method = "POST";
          var url = "formdatas";

          var postData = {};
          postData["onModelAddedby"] = "User";
          postData["status"] = "active";
          postData["formid"] = doc.formid;
          postData["property"] = {};
          postData["property"]["shared"] = [];
          postData["property"]["shared"] = doc.shared;


          this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, postData, doc._id)
            .then((data: any) => {
              if (data) {
              }
            }).catch((error) => {
              console.error(error);
            });
        }
      }

      setTimeout(() => {
        if (ind + 1 == this.TEMPLATE_ELEMENT_DATA.length) {
          this.disableBtn = false;
          super.showNotification("top", "right", "Updated Successfully  !!", "success");
          $("#teClose").click();
          this.ngOnInit()
        }
      }, 2000);
    });

  }

  async getMydrive() {

    var url = "documents/filter/view";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "userid", "searchvalue": this._loginUserId, "datatype": "ObjectId", "criteria": "eq" });

    this.isLoadingPU = true;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {


        if (data) {

          this.isLoadingPU = false;

          if (data && data.length > 0) {
            this.allData = data[0];
            this.mydriveData = data[0]["mydrive"];
          }
        }
      }).catch((error) => {
        console.error(error);
      });

    await this.setData();
  }

  async setData() {

    this.DOCUMENT_ELEMENT_DATA = [];

    if (this.mydriveData && this.mydriveData.length > 0) {
      this.mydriveData.forEach(element => {
        element.sizeType = "---"
        if (element.size) {
          element.sizeType = this.formatBytes(element.size)
        }
        let obj = {
          checked: element.shared && element.shared.length > 0 ? element.shared.includes(this.bindId) : false,
          createdAt: element.createdAt,
          addedby: element.addedby,
          _id: element._id,
          name: element.title,
          path: element.path,
          shared: element.shared,
          sizeType: element.sizeType,
          type: element.path.substr(element.path.lastIndexOf('.') + 1)
        }
        this.DOCUMENT_ELEMENT_DATA.push(obj);
      });
    }
    this.documentdataSource = new MatTableDataSource();
    this.documentdataSource = new MatTableDataSource(this.DOCUMENT_ELEMENT_DATA);
    this.documentdataSource.paginator = this.documentpaginator;
    this.documentdataSource.sort = this.documentsort;

  }

  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async saveShared() {

    var url = "documents";
    var method = "PATCH";

    this.disableBtn = true;
    this.DOCUMENT_ELEMENT_DATA.forEach(async (doc, ind) => {

      if (!doc.shared) {
        doc.shared = [];
      }

      if (doc.checked) {
        var fnd = doc.shared.find((a) => a == this.bindId);
        if (!fnd) {
          doc.shared.push(this.bindId);
        }
      } else {
        var fnd = doc.shared.find((a) => a == this.bindId);
        if (fnd) {
          var i = doc.shared.findIndex((i) => i == this.bindId);
          doc.shared.splice(i, 1);
        }
      }

      let postData = {};
      postData["shared"] = [];
      postData["shared"] = doc.shared;
      postData["onModel"] = "Member";

      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData, doc._id)
        .then((data: any) => {
          if (data) {

            if (ind + 1 == this.DOCUMENT_ELEMENT_DATA.length) {
              this.disableBtn = false;
              super.showNotification("top", "right", "Updated Successfully  !!", "success");
              $("#docClose").click();
            }

          }

        }).catch((error) => {
          console.error(error);
        });

    });
  }

  getAttachmentPath(extension: any) {
    switch (extension) {
      case "ppt":
        return "../../../../../assets/img/dg-ppt-icon.svg";
      case "xls":
        return "../../../../../assets/img/dg-excel-icon.svg";
      case "doc":
        return "../../../../../assets/img/dg-doc-icon.svg";
      case "docx":
        return "../../../../../assets/img/dg-doc-icon.svg";
      case "pdf":
        return "../../../../../assets/img/dg-pdf-icon.svg";
      case "txt":
        return "../../../../../assets/img/dg-text-icon.svg";
      case "folder":
        return "../../../../../assets/img/dg-folder-icon.svg";
      default:
        return "../../../../../assets/img/image_placeholder.jpg";
    }
  }

  onchangeamountofpaymentterm() {
    this.dataSource.data.forEach((elePaymentTerms: any) => {
      let amount = elePaymentTerms.amount;
      if (elePaymentTerms.discount != undefined && elePaymentTerms.discount != 0) {
        amount -= elePaymentTerms.discount;
      }
      elePaymentTerms.taxamount = 0;
      elePaymentTerms.totalamount = 0;
      if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
        elePaymentTerms.taxamount = this._commonService.calTaxes(elePaymentTerms.taxes, amount);
      }
      elePaymentTerms.totalamount = amount + elePaymentTerms.taxamount;
    });
  }

  onchangetotalamountofpaymentterm() {
    this.dataSource.data.forEach((elePaymentTerms: any) => {
      if (elePaymentTerms.isedit == true) {
        let totalamount = elePaymentTerms.totalamount;
        elePaymentTerms.taxamount = 0;
        elePaymentTerms.amount = 0;
        elePaymentTerms.totalpercent = 0;
        if (elePaymentTerms.taxes && elePaymentTerms.taxes.length !== 0) {
          elePaymentTerms.taxamount = this._commonService.calTaxes(elePaymentTerms.taxes);
        }
        elePaymentTerms.amount = Math.round(totalamount / (1 + (elePaymentTerms.totalpercent / 100)));
        elePaymentTerms.taxamount += totalamount - elePaymentTerms.amount;
      }
    });
  }


  editElement(obj: any) {
    if (obj) {
      obj.isedit = false;
      this.dataSource.data.forEach(ele => {
        if (ele['_id'] == obj._id) {
          ele['isedit'] = true;
        } else {
          ele['isedit'] = false;
        }
      });
    }
  }



  updatePayTerms(obj: any) {

    if (obj.discount > obj.amount) {
      this.showNotification('top', 'right', 'Discount cannot be greater than amount!!!', 'danger');
      return;
    }

    let item: any;
    item = JSON.parse(JSON.stringify(obj));
    if (item.membershipid != undefined && item.membershipid._id != undefined) {
      item.membershipid = item.membershipid._id;
    }
    if (item.paymentitem != undefined && item.paymentitem._id != undefined) {
      item.paymentitem = item.paymentitem._id;
    }
    if (item.taxes != undefined && item.taxes.length > 0) {
      let txarr: string[] = [];
      item.taxes.forEach(element => {
        if (element._id != undefined) {
          txarr.push(element._id);
        }
      });
      item.taxes = txarr;
    } else {
      item.taxes = [];
    }
    if (item) {
      if (item.amount != undefined && item.amount <= 0) {
        this.showNotification('top', 'right', 'Please enter amount!!!', 'danger');
        return;
      }

      var url = "paymentterms"
      this.disableBtn = true;
      if (item.memberid == undefined) {
        item.memberid = this.dataContent._id;

        var method = "POST";
        this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, item)
          .then(async (data: any) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Payment terms has been updated successfully!!!', 'success');
              obj['isedit'] = false;
              await this.getPaymentTerms();
              this.reloadingStr = "paymentterms";
            }
          }, (error) => {
            console.error(error);
            this.disableBtn = false;
          });
      } else if (item.memberid != undefined && item.memberid == this.dataContent._id) {
        var method = "PUT";
        this._commonService
          .commonServiceByUrlMethodDataAsync(url, method, item, item._id)
          .then(async (data) => {
            if (data) {
              this.disableBtn = false;
              this.showNotification('top', 'right', 'Payment terms has been updated successfully!!!', 'success');
              obj['isedit'] = false;
              await this.getPaymentTerms();
              this.reloadingStr = "paymentterms";
            }
          }, (error) => {
            console.error(error);
            this.disableBtn = false;
          });
      }
    }
  }

  async deleteElement(obj: any) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        if (obj && obj._id) {
          let url = "paymentterms/"
          let method = "DELETE";
          let id = obj._id;

          this.disableBtn = true;

          await this._commonService
            .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
            .then(async (data: any) => {
              if (data) {
                this.disableBtn = false;
                this.showNotification('top', 'right', 'Payment terms has been deleted successfully !!', 'success');
                await this.getPaymentTerms();
                this.reloadingStr = "paymentterms";
              }
            }, (error) => {
              console.error(error);
              this.disableBtn = false;
            });
        }
      }
    });

  }



}