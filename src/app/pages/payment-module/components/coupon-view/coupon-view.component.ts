import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs"; 
import { BaseComponemntComponent } from "../../../../shared/base-componemnt/base-componemnt.component";

@Component({
  selector: "app-coupon-view",
  templateUrl: "./coupon-view.component.html",
})
export class CouponViewComponent extends BaseComponemntComponent implements OnInit, OnDestroy {

  subject = new Subject<number>();

  destroy$: Subject<boolean> = new Subject<boolean>();

  dataContent: any = {};
  tabPermission: any = []
  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  productList: any[] = [];
  assetList: any[] = [];
  servicesList: any[] = [];
  staffList: any[] = [];
  giftcardList: any[] = [];


  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.subscribe((params) => {
      this.bindId = params['id'];
      this._formId = params['formid'] ? params['formid'] : "5c654586a6ae2f2dcc76d3ba";
      this.contentVisibility = false;
      this.itemVisbility = false;
    });
  }

  async ngOnInit() {
    await super.ngOnInit();


    this._route.params.forEach(async (params) => {
      try {
        this.contentVisibility = false;
        this.itemVisbility = false;
        await this.initializeVariable();
        await this.LoadData();
        this.contentVisibility = true;
        this.itemVisbility = true;
      } catch (err) {
        console.error(err);
      }
    });
  }

  async initializeVariable() {
    if (this._loginUserRole && this._loginUserRole.permissions && this._loginUserRole.permissions.length !== 0) {
      var paymentObj = this._loginUserRole.permissions.find(p => p.formname == this._formName)
      if (paymentObj && paymentObj.tabpermission) {
        this.tabPermission = paymentObj.tabpermission;

      }
    }
    return;
  }

  async LoadData() {

    let method = "POST";
    let url = "coupons/filter";
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          console.log("data=>",data);
          this.dataContent = data[0];
          if (this.dataContent.items && this.dataContent.items.length > 0) {
            this.productList = this.dataContent.items;
          }
          if (this.dataContent.assets && this.dataContent.assets.length > 0) {
            this.assetList = this.dataContent.assets;
          }
          if (this.dataContent.services && this.dataContent.services.length > 0) {
            this.servicesList = this.dataContent.services;
          }
          if (this.dataContent.giftcards && this.dataContent.giftcards.length > 0) {
            this.giftcardList = this.dataContent.giftcards;
          }
        }
      }, (error) => {
        console.error(error);
      })
  }


  async getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.contentVisibility = false;
    await this.LoadData();
    this.contentVisibility = true;
  }

  async onSaveProduct(event: any) {
    if (event) await this.LoadData();
  }


  ngOnDestroy() {
    this.destroy$.next(false);
  }


}