import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-membership-usage',
  templateUrl: './membership-usage.component.html'
})

export class MembershipUsageComponent extends BaseComponemntComponent implements OnInit {


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
    this.pagename = "app-membership-usage";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });

    if (this._authService.currentUser != undefined && this._authService.currentUser.role != undefined) {
      this.currentRoleDetail = this._authService.currentUser.role;
      if (this.currentRoleDetail) {
        if (this.currentRoleDetail.roletype != undefined) {
          if (this.currentRoleDetail.roletype == 'M') {
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
    await this.getMembershipUsage();
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
    let url = "members/filter/view";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.dataContent = data[0];
          // console.log("this.dataContent", this.dataContent);
        }
      }, (error) => {
        console.error(error);
      })
  }


 async getMembershipUsage(){

  var url = "members/filter/usagesummary/view";
  // var url = "users/usageitemviews";
  var method = "POST";

  let postData = {};
  postData['search'] = [];
  postData['search'].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" });

  await this._commonService
    .commonServiceByUrlMethodDataAsync(url, method, postData)
    .then((data: any) => {
      // console.log("data", data)
      if (data && data.length > 0) {

        this.pacakgesLists = [];
        data.forEach(a => {
          if(a.addons && a.addons._id){
            this.pacakgesLists.push(a.addons);
          }  
        });
        data = data[0];

        let obj = {};
        obj['package'] = {};
        obj['packageusages'] = data.membershipusages;
        obj['package'] = { packageusages: data.membershipusages, items: data.product, assets: data.facility, services: data.service, usageterms: data.usageterms, booking: data.booking, membershipname: data.membershipname ? data.membershipname + '(M)' : null };

        this.pacakgesLists.unshift(obj);
        this.usageobject = [] , this.usageobjectArray  = [];
        this.usageobject = this.renderdata(data.membershipusages, data.product, data.facility, data.service, data.usageterms, data.booking);
        this.usageobjectArray  = this.groupBy(this.usageobject , 'category');
        this.selectedMembershipName = this.pacakgesLists[0];
        // console.log("this.usageobject", this.usageobject);

      }
    });
  }

  renderdata(membershipusage, product, facility, service, usageterms, booking){
    //console.log("membershipusage", membershipusage)
    var tempArray = [];
     if (product && product.length > 0) {
        product.forEach(pro => {
          let obj = {
            _id: pro.item._id,
            itemname: pro.item.itemname,
            category: "Products",
            visits: pro.quantity,
            discount: pro.discount,
            period: pro.period,
            quantity: 0,
            balance: pro.quantity
          }
          tempArray.push(obj)
        });
      }
      if (facility && facility.length > 0) {
        facility.forEach(faci => {
          let obj = {
            _id: faci.serviceid._id,
            itemname: faci.serviceid.title,
            category: "Facility",
            visits: faci.visits,
            discount: faci.discount,
            period: faci.period,
            balance: faci.visits
          }
          tempArray.push(obj);
        });
      }
      if (booking && booking.length > 0) {
        var visits = 0;
        booking.forEach(booking => {
          visits += booking.bookingdetail.totalnights * booking.bookingdetail.totalrooms;
        })
        if (visits > 0) {
         // console.log("booking", booking)
          let obj = {
            _id: '',
            itemname: "ROOM BOOKING",
            category: "Booking",
            visits: usageterms.eligiblenight,
            discount: 100,
            period: "Yearly",
            quantity: 0,
            balance: usageterms.eligiblenight
          }

          tempArray.push(obj)
        }
      }

      if (service && service.length > 0) {
        service.forEach(faci => {
          let obj = {
            _id: faci.serviceid._id,
            itemname: faci.serviceid.title,
            category: "Service",
            visits: faci.visits,
            discount: faci.discount,
            period: faci.period,
            balance: faci.visits
          }
          tempArray.push(obj);
        });
      }

      /*-----------------for Quantity-------------*/
      if (membershipusage) {
        let currentYear  = new Date().getFullYear();
        membershipusage.forEach(element => {

          let updatedYear  = new Date(element.createdAt).getFullYear();
       
          var item = tempArray.find((item) => {
            if (!item._id) return item;
            return item._id.toString() == element.usage.refid.toString()
          });
          if (item) { 
            if(isNaN(item.quantity)) {item.quantity = 0};
            item.quantity += element.usage.quantity;
            item.balance -=  updatedYear == currentYear ?   element.usage.quantity : 0;
            this.yearList.forEach(years => {  
            if(!item[years]){item[years] = 0};
            if(updatedYear == years){
              item[years] += element.usage.quantity; 
            };
           });
            
          }
       
      });
      }
     
      return tempArray;
  }

  onPCSelect(item: any){
    this.usageobject = [] , this.usageobjectArray  = [];
    this.usageobject = this.renderdata(item.packageusages, item.package.items, item.package.assets, item.package.services, item.package.usageterms, item.package.booking);
    this.usageobjectArray  = this.groupBy(this.usageobject , 'category');
  }

  onItemSelect1(item: any) {
    this.selectedPEriodName = item;
    this.getMembershipUsage();
  }




  groupBy(collection: any, property: any) {
    let i = 0, val, index,
      values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }


}
