import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-customer-usage',
  templateUrl: './customer-usage.component.html'
})

export class CustomerUsageComponent extends BaseComponemntComponent implements OnInit {

  bindId: any;
  selectedPEriodName: any
  dataContent: any;
  usageobject = []

  currentRoleDetail: any;
  isMemberLogin: boolean = false;
  currUserid: any;

  isLoadingDate: boolean = false;
  pacakgesLists : any[] = [];
  usageobjectArray : any[] = [];

  yearList : any[]= [];

  selectedMembershipName : any;

  constructor(
    private _route: ActivatedRoute,
  ) {
    super();
    this.pagename = "app-customer-usage";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });

    if (this._authService.currentUser != undefined && this._authService.currentUser.role != undefined) {
      this.currentRoleDetail = this._authService.currentUser.role;
      if (this.currentRoleDetail) {
        if (this.currentRoleDetail.roletype != undefined) {
          if (this.currentRoleDetail.roletype == 'C') {
            this.bindId = this._authService.currentUser._id
          }
        }
      }
    }
  }

  async ngOnInit() {
    this.isLoadingDate = true;
   
    await super.ngOnInit();
    await this.initVariable();
    await this.LoadData();
    await this.getCustomerUsage();
    this.isLoadingDate = false;
  }

 async initVariable(){
    this.selectedPEriodName = 'Yearly';
    this.yearList = [];
    var today = new Date();

    for (let i = 0; i <= 2; i++) {
      this.yearList.push(today.getFullYear() - i );
    }
    return;
  }

  async LoadData() {
    let method = "POST";
    let url = "prospects/filter/view";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.dataContent = data[0];
        }
      }, (error) => {
        console.error(error);
      })
  }

  onPCSelect(item: any){
    this.pacakgesLists = [];
    this.pacakgesLists.push(this.usageobjectArray.find(x => x.packagename == item.packagename))
  }


 async getCustomerUsage(){
  var url = "prospects/filter/usagesummary/view";
  var method = "POST";

  let postData = {};
  postData['search'] = [];
  postData['search'].push({ "searchfield": "customerid", "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" });
 
  await this._commonService
    .commonServiceByUrlMethodDataAsync(url, method, postData)
    .then((data: any) => {
      if (data && data.length > 0) {

        this.pacakgesLists = [];
        this.pacakgesLists = data;
        this.usageobjectArray = this.pacakgesLists;
      }
    });
  }
}
