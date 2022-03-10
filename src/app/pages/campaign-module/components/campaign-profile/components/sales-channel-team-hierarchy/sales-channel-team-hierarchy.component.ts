import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-sales-channel-team-hierarchy',
  templateUrl: './sales-channel-team-hierarchy.component.html',
  styleUrls: ['./sales-channel-team-hierarchy.component.css']
})
export class SaleChannelTeamHierarchyComponent extends BaseLiteComponemntComponent implements OnInit {

  @Input() dataContent: any;
  
  salesDesignation: ISalesDesignation;

  saleschannelsObj: any = {};
  selectedSaleschannelDetailToadd: any = {};

  selectedSaleschannelteamDetail: any = {};
  selectedSaleschannelDetail: any = {};
  salesTeamDesignation: ISalesTeam;

  constructor(
  ) {
    super();
    this.pagename = "app-sales-channel-team-hierarchy";

  }

  async ngOnInit() {
    await super.ngOnInit();
    if (this.dataContent)
      this.getselectedSaleschannelteamDetail();
  }

  getselectedSaleschannelteamDetail() {
    this.selectedSaleschannelteamDetail = this.dataContent.saleschannelteams;
    if (this.selectedSaleschannelteamDetail) {
      if (this.selectedSaleschannelteamDetail.saleschannelid) {
        this.getselectedSaleschannelDetail();
      }
    }
  }

  getselectedSaleschannelDetail() {
    this.selectedSaleschannelDetail = this.dataContent.saleschannelteams.saleschannelid;

    if (this.selectedSaleschannelDetail != undefined) {
      let obj: ISalesTeam = {
        designationid: this.selectedSaleschannelDetail.channelhead._id,
        name: this.selectedSaleschannelDetail.channelhead.title,
        designation: this.selectedSaleschannelDetail.channelhead.title,
        userList: [],
        many: false,
        subordinates: []
      }

      if (this.selectedSaleschannelDetail.channels != undefined && this.selectedSaleschannelDetail.channels.length > 0) {
        this.procSalesChannelND(obj, this.selectedSaleschannelDetail.channels, this.selectedSaleschannelDetail.channelhead);
      } else {
        if (this.selectedSaleschannelteamDetail.channels != undefined && this.selectedSaleschannelteamDetail.channels.length > 0) {
          let tempArr: any[];
          tempArr = this.selectedSaleschannelteamDetail.channels;
          obj.userList = [];
          tempArr.forEach(ele => {
            if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
              if (ele.designationid._id == obj.designationid) {
                obj.userList.push(ele);
              }
            } else {
              if (ele.designationid == obj.designationid) {
                obj.userList.push(ele);
              }
            }
          });
        }
      }
      this.salesTeamDesignation = obj;
      
    }
  }

  procSalesChannelND(objSD: ISalesTeam, subList: any, eleParent: any) {
    subList.forEach(ele99 => {
      if (ele99.designationhead != undefined && ele99.designationhead._id == eleParent._id) {
        let tempuList: any[] = [];
        if (this.selectedSaleschannelteamDetail.channels != undefined && this.selectedSaleschannelteamDetail.channels.length > 0) {
          let tempArr: any[];
          tempArr = this.selectedSaleschannelteamDetail.channels;
          tempArr.forEach(ele => {
            if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
              if (ele.designationid._id == ele99.designation._id) {
                tempuList.push(ele);
              }
            } else {
              if (ele.designationid == ele99.designation._id) {
                tempuList.push(ele);
              }
            }
          });
        }

        let obj4: ISalesTeam = {
          designationid: ele99.designation._id,
          name: ele99.designation.title,
          designation: ele99.designation.title,
          userList: tempuList,
          many: ele99.many,
          subordinates: []
        }

        this.procSalesChannelND(obj4, subList, ele99.designation);

        if (this.selectedSaleschannelteamDetail.channels != undefined && this.selectedSaleschannelteamDetail.channels.length > 0) {
          let tempArr: any[];
          tempArr = this.selectedSaleschannelteamDetail.channels;
          objSD.userList = [];
          tempArr.forEach(ele => {
            if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
              if (ele.designationid._id == objSD.designationid) {
                objSD.userList.push(ele);
              }
            } else {
              if (ele.designationid == objSD.designationid) {
                objSD.userList.push(ele);
              }
            }
          });
        }
        objSD.subordinates.push(obj4);
      } else {
        return;
      }

    });
  }
}


export interface ISalesTeam {
  designationid: string;
  name: string;
  designation: string;
  many: boolean;
  userList: any[];
  subordinates: ISalesTeam[];
}

export interface ISalesDesignation {
  designationid: string;
  name: string;
  designation: string;
  many: boolean;
  subordinates: ISalesDesignation[];
}