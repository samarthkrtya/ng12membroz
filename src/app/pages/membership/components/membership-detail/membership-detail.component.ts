import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Subject } from 'rxjs';

import { MembershipService } from '../../../../core/services/membership/membership.service';
import { PaymentItemService } from '../../../../core/services/payment/paymentitem.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { PaymentTermsService } from '../../../../core/services/payment/paymentterm.service';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-membership-detail',
  templateUrl: './membership-detail.component.html'
})
export class MembershipDetailComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  dataHtml = '<img [src]="../assets/img/membroz-logo.png" class="profile-avatar-img mr-3 rounded-circle" alt=""><div class="media-body"><div class="font-500 mb-1">$[{membershipname}]</div><div class="d-flex"><div class="flex-grow-1"> <svg xmlns="http://www.w3.org/2000/svg" width="22" height="21.999" viewBox="0 0 22 21.999" class="mr-1"><g transform="translate(-13710 408)"><g transform="translate(13714 -404)"><g transform="translate(2.249)"><g transform="translate(0)"><path d="M84.743,0a4.751,4.751,0,1,0,4.751,4.751A4.751,4.751,0,0,0,84.743,0Zm2.5,4.079L86.42,5.107l.09,1.343a.43.43,0,0,1-.181.381.435.435,0,0,1-.25.08.423.423,0,0,1-.168-.035l-1.166-.495-1.165.5a.432.432,0,0,1-.6-.426l.09-1.343-.821-1.028a.432.432,0,0,1,.228-.688l1.224-.32.672-1.132a.448.448,0,0,1,.742,0l.672,1.132,1.226.32a.433.433,0,0,1,.229.688Z" transform="translate(-79.992)" class="svg-fill-secondary-icon" /></g></g><g transform="translate(0 7.732)"><path d="M2.054,279.776.06,283.238a.432.432,0,0,0,.486.633l2.536-.682.675,2.536a.433.433,0,0,0,.359.317l.057,0a.432.432,0,0,0,.374-.216l1.886-3.264a5.617,5.617,0,0,1-4.379-2.79Z" transform="translate(-0.003 -279.776)" class="svg-fill-secondary-icon" /></g><g transform="translate(7.569 7.733)"><g transform="translate(0 0)"><path d="M280.095,283.239l-1.995-3.461a5.615,5.615,0,0,1-4.38,2.789l1.886,3.264a.432.432,0,0,0,.374.216.4.4,0,0,0,.055,0,.434.434,0,0,0,.361-.316l.675-2.536,2.536.682a.432.432,0,0,0,.487-.632Z" transform="translate(-273.72 -279.778)" class="svg-fill-secondary-icon" /></g></g></g><g transform="translate(13710.479 -408)"><g transform="translate(-0.478 0)"><path d="M18.483,3.106a11.067,11.067,0,0,0-15.377,0,11.066,11.066,0,1,0,15.65,15.651,11.067,11.067,0,0,0-.273-15.651Zm-.248,15.129h0a10.329,10.329,0,1,1,3.025-7.3,10.329,10.329,0,0,1-3.025,7.3Z" transform="translate(0.137 0)" class="svg-fill-secondary-icon" /></g></g></g></svg> $[{property.tenure}] - $[{property.unit}]</div> <div class="text-danger">$[{status}]</div></div></div>';
  dataContent: any;
  postSearch: any;


  displayedColumns2: string[] = ['paymentitem', 'period', 'tenure', 'amount', 'discount', 'ismembershipfees', 'startperiod',  'date', 'taxes', 'action'];

  periodList: any[] = [
    { code: 'Yearly', value: 'Yearly' },
    { code: 'Half-Yearly', value: 'Half-Yearly' },
    { code: 'Quarterly', value: 'Quarterly' },
    { code: 'Monthly', value: 'Monthly' },
    { code: 'Once', value: 'Once' },
  ];

  taxesList: any[] = [];
  paymentItemList: any[] = [];
  paymentTermList: any[] = [];

  isLoadingTerms: boolean = false;
  isLoadingData: boolean = true;
  itemVisbility: boolean = true;
  disableBtn: boolean = false;

  serviceList: any[] = [];
  productList: any[] = [];
  assetList: any[] = [];

  tabPermission: any[] = [];

  constructor(
    private _route: ActivatedRoute,

    private _membershipService: MembershipService,
    private _paymentitemService: PaymentItemService,
    private _taxesService: TaxesService,
    private _paymentTermsService: PaymentTermsService,
  ) {
    super();
    this.pagename = "app-membership-detail";

    this._route.params.forEach((params) => {
      this._formName = params["formname"];
      this.bindId = params["id"];
      this.itemVisbility = false;
    });

  }

  async ngOnInit() {
    this.isLoadingData = true;
    await super.ngOnInit();
    await this.loadData();
    this.isLoadingData = false;
  }

  async loadData() {
    await this.getTaxesList();
    await this.getMembership();
    await this.getAllPaymentItemList();
    await this.getAllPaymentTerms();

    this.tabPermission = [];
    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var permsnObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (permsnObj && permsnObj.tabpermission) {
        this.tabPermission = permsnObj.tabpermission;
      }
    }
  }

  async getTaxesList() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    var data = await this._taxesService.getByAsyncFilter(postData) as any;
    this.taxesList = data;
  }

  async getMembership() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    var data = await this._membershipService.AsyncGetByfilter(postData) as any;

    this.dataContent = data[0];
    // console.log("this.dataContent",this.dataContent);
    this.serviceList = [];
    this.productList = [];
    this.assetList= [];
    let obj = {};
    
    if (this.dataContent.items && this.dataContent.items.length > 0) {
      //  maybe need to add level and exapndable etc;
      this.dataContent.items.forEach(srvc => {
        obj = { '_id': srvc.item._id, 'item': srvc.item.itemname, 'category': srvc.item.category && srvc.item.category.property && srvc.item.category.property.title ? srvc.item.category.property.title : '', 'discount': srvc.discount, 'qty': srvc.quantity, 'period': srvc.period, fromdb: true };
        this.productList.push(obj);
      });
    }

    if (this.dataContent.services && this.dataContent.services.length > 0) {
      //  maybe need to add level and exapndable etc;
      // expandable: false
      // level: 1
      this.dataContent.services.forEach(srvc => {
        obj = { '_id': srvc.serviceid._id, 'item': srvc.serviceid.title, 'category': srvc.serviceid && srvc.serviceid.category && srvc.serviceid.category.property.name ? srvc.serviceid.category.property.name : '', 'discount': srvc.discount, 'visits': srvc.visits, 'period': srvc.period, fromdb: true };
        this.serviceList.push(obj);
      });
    }
   

    if (this.dataContent.assets && this.dataContent.assets.length > 0) {
      //  maybe need to add level and exapndable etc;
      // expandable: false
      // level: 1

      this.dataContent.assets.forEach(srvc => {
        obj = { '_id': srvc.serviceid._id, 'item': srvc.serviceid.title, 'category': srvc.serviceid.category.property.name, 'discount': srvc.discount, 'visits': srvc.visits, 'period': srvc.period, fromdb: true };
        this.assetList.push(obj);
      });
    }


    let dataSource = this.productList;
    let cloned = dataSource.slice();
    this.productList = cloned;
    let dataSource1 = this.serviceList;
    let cloned1 = dataSource1.slice();
    this.serviceList = cloned1;

    this.itemVisbility = true;
    this.postSearch = [];
    this.postSearch.push({ "searchfield": "status", "searchvalue": 'active', "criteria": "eq", "datatype": 'text' });
    if (this._formName == 'package') {
      this.postSearch.push({ "searchfield": "property.type", "searchvalue": 'package', "criteria": "eq" });
    }

  }

  async getAllPaymentItemList() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    this.isLoadingTerms = true;
    var data = await this._paymentitemService.getByAsyncfilter(postData) as any;
    this.paymentItemList = data;
    this.isLoadingTerms = false;
  }

  async getAllPaymentTerms() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "membershipid", "searchvalue": this.bindId, "criteria": "eq" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "memberid", "searchvalue": false, "criteria": "exists", "datatype": "boolean" });

    this.isLoadingTerms = true;
    var data = await this._paymentTermsService.getbyAsyncFilter(postData) as any[];
    
    this.paymentTermList = [];
    if (data && data.length > 0) {
      data.forEach((ptrms: any) => {
        if (ptrms.paymentitem) {
          let obj = { 
              pt_id: ptrms._id,
              pi_id: ptrms.paymentitem._id,
              paymentitem: ptrms.paymentitem,
              period: ptrms.period,
              tenure: ptrms.tenure,
              amount: ptrms.amount,
              startperiod: ptrms.startperiod, 
              date: ptrms.date,
              ismembershipfees: ptrms.ismembershipfees ? ptrms.ismembershipfees : false,
              discount: ptrms.discount,
              taxes: ptrms.taxes,
              action: { isAdd: false, isEdit: true, isUpdate: false, isDelete: true, isDisplayOnly: true } 
          }
          this.paymentTermList.push(obj);
        }
      });
      data.forEach((pytrm: any) => {    // remove paymentitems if already exist
        if (pytrm.paymentitem) {
          let ind = this.paymentItemList.findIndex(a => a._id == pytrm.paymentitem._id);
          this.paymentItemList.splice(ind, 1);
        }
      });
      
    }
    this.isLoadingTerms = false;
  }

  choosePaymentItem(paymentItem: any) {
    var ind = this.paymentTermList.findIndex(a => a.pi_id == paymentItem._id);
    if (ind == -1) {
      let obj = { pt_id: '', pi_id: paymentItem._id, paymentitem: paymentItem ,date: null, periodList: this.periodList, tenure: 0, amount: 0, startperiod: 0, ismembershipfees: false, discount: 0, taxes: this.taxesList, selectedTaxes: [], action: { isAdd: true, isEdit: false, isUpdate: false, isDelete: false, isDisplayOnly: false } };
      let dataSource = this.paymentTermList;
      dataSource.push(obj);
      let cloned = dataSource.slice();
      this.paymentTermList = cloned;
    }
  }

  changeTaxes(event: any[], item: any) {
    this.paymentTermList.map(function (paymentterms) {
      if (paymentterms.pi_id == item.pi_id) {
        paymentterms.selectedTaxes = event;
      }
    });
  }

  async onSave(paymentitem: any, action: string) {
    var tempthis = this;
    if (action == 'add' || action == 'update') {
      if(paymentitem.date && paymentitem.date > 31){
        super.showNotification("top", "right", "Enter valid fix date !!", "danger");
        return;
      }
      let model = {
        'membershipid': this.bindId,
        'paymentitem': paymentitem.pi_id,
        'tenure': paymentitem.selectedperiod == 'Once' ? 1 : paymentitem.tenure,
        'period': paymentitem.selectedperiod,
        'amount': paymentitem.amount ? paymentitem.amount : 0,
        'date': paymentitem.date ? paymentitem.date : null,
        'ismembershipfees': paymentitem.ismembershipfees,
        'discount': paymentitem.discount,
        'startperiod': paymentitem.startperiod,
        'taxes': paymentitem.selectedTaxes,
      };
      if (model.amount < 0 || model.tenure < 0) {
        super.showNotification("top", "right", "Enter valid number !!", "danger");
        return;
      } else if ((model.discount && model.discount < 0) || (model.startperiod && model.startperiod < 0)) {
        super.showNotification("top", "right", "Enter valid fields !!", "danger");
        return;
      } else if (!model.period) {
        super.showNotification("top", "right", "Enter required fields !!", "danger");
        return;
      }

      if (paymentitem.pt_id == '' && action == 'add') {
        this.disableBtn = true;
        var data = await this._paymentTermsService.AsyncAdd(model);
        super.showNotification("top", "right", "Payment terms added successfully !!", "success");
        this.disableBtn = false;
        await this.getAllPaymentItemList();
        await this.getAllPaymentTerms();
      } else {
        this.disableBtn = true;
        var data = await this._paymentTermsService.AsyncUpdate(paymentitem.pt_id, model);
        super.showNotification("top", "right", "Payment terms updated successfully !!", "success");
        this.disableBtn = false;
        await this.getAllPaymentItemList();
        await this.getAllPaymentTerms();
      }
    } else if (action == 'edit') {
      this.paymentTermList.map(function (paymentterms) {
        if (paymentterms.pt_id == paymentitem.pt_id) {

          var array = [];
          if (paymentitem.taxes) {
            paymentitem.taxes.forEach(ele => {
              array.push(ele._id);
            });
          }
          paymentterms.periodList = tempthis.periodList;
          paymentterms.selectedperiod = paymentitem.period;
          paymentterms.taxes = tempthis.taxesList;
          paymentterms.selectedTaxes = array;

          paymentterms.action = { isAdd: false, isDelete: false, isDisplayOnly: false, isEdit: false, isUpdate: true };
        }
      });
    } else if (action == 'delete') {
      this.disableBtn = true;
      var data = await this._paymentTermsService.AsyncDelete(paymentitem.pt_id);
      super.showNotification("top", "right", "Payment terms deleted successfully !!", "success");
      this.disableBtn = false;
      await this.getAllPaymentItemList();
      await this.getAllPaymentTerms();
    }else if(action == 'cancel'){
      paymentitem.action = { isAdd: false, isDelete: true, isDisplayOnly: true, isEdit: true, isUpdate: false };
    }
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }

  async onSaveService(event) {
    await this.getMembership();
  }

  async onSaveProduct(event) {
    await this.getMembership();
  }

  async onSaveAsset(event) {
    await this.getMembership();
  }


  async onSaveUsageTerms(event) {
    await this.getMembership();
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

}

@Pipe({
  name: 'sanitizeHtml'
})
export class SanitizeHtmlPipe implements PipeTransform {
  constructor(private _sanitizer: DomSanitizer) { }
  transform(v: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(v);
  }
}
