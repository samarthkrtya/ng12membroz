import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SalesChannelTeamService } from 'src/app/core/services/marketing/sales-channel-team.service';
import { UsersService } from 'src/app/core/services/users/users.service';


import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { ISalesDesignation } from '../../sales-channel/sales-channel-hierarchy/sales-channel-hierarchy.component';

declare var $: any;
@Component({
  selector: 'app-sales-channel-team-hierarchy',
  templateUrl: './sales-channel-team-hierarchy.component.html',
  styleUrls: ['./sales-channel-team-hierarchy.component.css']
})
export class SaleChannelTeamHierarchyComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Output() addedSalesChannel: EventEmitter<any> = new EventEmitter<any>();

  salesDesignation: ISalesDesignation;

  saleschannelsObj: any = {};
  selectedSaleschannelDetailToadd: any = {};

  btnDisable: boolean = false;


  selectedSaleschannel: string = '';
  selectedSaleschannelteamDetail: any = {};
  selectedSaleschannelteamDetailToadd: any = {};
  selectedSaleschannelDetail: any = {};
  salesTeamDesignation: ISalesTeam;

  userList: any[] = [];
  userListByDesignation: any[] = [];

  posHeadUserList: any[] = [];
  currentDesignation: string;
  isChannelHead = false;
  isMany = false;

  constructor(
    private _usersService: UsersService,
    private _saleschannelteamService: SalesChannelTeamService,

  ) {
    super();
    this.pagename = "app-sales-channel-team-hierarchy";
    this.getAllUserList();
  }

  async ngOnInit() {
    await super.ngOnInit();
    if (this.dataContent)
      this.getselectedSaleschannelteamDetail();
  }

  getAllUserList() {
    let userFilter: any = {};
    userFilter.search = [{ "searchfield": "status", "searchvalue": "active", "criteria": "eq" }];
    this._usersService
      .GetAllfilteredUserData(userFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        if (data) {
          this.userList = [];
          this.userList = data;

        }
      });
  }

  getselectedSaleschannelteamDetail() {
    this.selectedSaleschannelteamDetail = this.dataContent;
    if (this.selectedSaleschannelteamDetail) {
      this.selectedSaleschannelteamDetailToadd = JSON.parse(JSON.stringify(this.selectedSaleschannelteamDetail));
      if (this.selectedSaleschannelteamDetail.saleschannelid) {
        this.selectedSaleschannel = this.selectedSaleschannelteamDetail.saleschannelid._id;
        this.getselectedSaleschannelDetail();
      }
    }
  }

  getselectedSaleschannelDetail() {
    this.selectedSaleschannelDetail = this.dataContent.saleschannelid;

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

  clearSalesChannelTeamDesignationForm() {
    this.selectedSaleschannelteamDetailToadd = JSON.parse(JSON.stringify(this.selectedSaleschannelteamDetail));
  }


  checkUncheckEvent(objToCheck: any) {
    this.isMany = false;
    if (objToCheck.checked == false) {
      if (this.selectedSaleschannelteamDetailToadd.channels.length > 0) {
        let tmpobj = this.selectedSaleschannelteamDetailToadd.channels.find(ele => ele.designationid._id != undefined && ele.designationid._id != this.currentDesignation && ele.head != undefined && ele.head != null && ele.head._id == objToCheck.source.id)
        if (tmpobj != undefined) {
          this.showNotification('top', 'right', 'Please remove subordinate first.', 'danger');
          $('#closedesg').click();
          this.clearSalesChannelTeamDesignationForm();
          return;
        }
      }
    }
    if (this.selectedSaleschannelDetail !== undefined && this.selectedSaleschannelDetail.channels.length > 0) {
      let tmpobj = this.selectedSaleschannelDetail.channels.find(ele => ele.designation._id != undefined && ele.designation._id == this.currentDesignation);
      if (tmpobj != undefined && tmpobj.many != undefined && tmpobj.many) {
        this.isMany = true;
      }
    }
    if (this.isMany == false) {
      this.userListByDesignation.forEach(ele => {
        let tempbool = false;
        if (ele._id == objToCheck.source.value) {
          if (ele.checked == true) {
            tempbool = true;
          }
        }
        if (tempbool == false) {
          if (this.selectedSaleschannelteamDetailToadd.channels.length > 0) {
            let tmpobj = this.selectedSaleschannelteamDetailToadd.channels.find(ele88 => ele88.designationid._id != undefined && ele88.designationid._id != this.currentDesignation && ele88.head != undefined && ele88.head != null && ele88.head._id == ele._id);
            if (tmpobj != undefined) {
              this.showNotification('top', 'right', 'Please remove subordinate first.', 'danger');
              $('#closedesg').click();
              this.clearSalesChannelTeamDesignationForm();
              return;
            }
          }
          ele.checked = false;
        }
      });
    }
    if (this.selectedSaleschannelteamDetailToadd.channels.length > 0) {
      this.selectedSaleschannelteamDetailToadd.channels = this.selectedSaleschannelteamDetailToadd.channels.filter(ele => (Object.prototype.toString.call(ele.designationid) == '[object Object]') ? (ele.designationid._id != this.currentDesignation) : (ele.designationid != this.currentDesignation));
    }
    this.userListByDesignation.forEach(ele => {
      if (ele.checked != undefined && ele.checked == true) {
        let obj: any = { 'userid': '', 'designationid': '', 'head': null };
        if (ele._id != undefined) {
          obj.userid = ele._id;
        }
        if (ele.designationid != undefined) {
          //obj.designationid = ele.designationid;
          if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
            obj.designationid = ele.designationid._id;
          } else {
            obj.designationid = ele.designationid;
          }
        }
        if (ele.head != undefined) {
          obj.head = ele.head;
        } else if (ele.head == undefined || ele.head == null || ele.head == '') {
          if (this.isChannelHead == false) {
            this.showNotification('top', 'right', 'Please select head first.', 'danger');
            $('#closedesg').click();
            this.clearSalesChannelTeamDesignationForm();
            return;
          } else {
        obj.head = null;
          }
        } else {
        obj.head = null;
        }
        this.selectedSaleschannelteamDetailToadd.channels.push(obj);

      }
    });
  }

  updateSalesTeamDesignation(salesDesId: any) {
    this.currentDesignation = salesDesId;
    this.posHeadUserList = [];
    if (this.selectedSaleschannelDetail.channelhead != undefined && this.selectedSaleschannelDetail.channelhead._id != undefined) {
      if (this.selectedSaleschannelDetail.channelhead._id == salesDesId) {
        this.isChannelHead = true;
        this.isMany = false;
      } else {
          this.isChannelHead = false;
          if (this.selectedSaleschannelDetail.channels && this.selectedSaleschannelDetail.channels.length > 0) {
            let tempArr: any[] = this.selectedSaleschannelDetail.channels;

            let tempobj: any;
            tempobj = tempArr.find(ele => {
              if (ele.designation && ele.designation._id == salesDesId) {
                return true;
              } else {
                return false;
              }
            });
            if (tempobj) {
              if (tempobj.many == true) {
                this.isMany = true;
              } else {
                this.isMany = false;
              }
              if (tempobj.designationhead && tempobj.designationhead._id) {
                if (this.selectedSaleschannelteamDetail) {
                  if (this.selectedSaleschannelteamDetail.channels && this.selectedSaleschannelteamDetail.channels.length > 0) {
                    let tempArr: any[] = this.selectedSaleschannelteamDetail.channels;
                    let tempHeadUserList: any[];
                    tempHeadUserList = tempArr.filter(ele => {
                      if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
                        if (ele.designationid && ele.designationid._id == tempobj.designationhead._id) {
                          return true;
                        } else {
                          return false;
                        }
                      } else {
                        if (ele.designationid && ele.designationid == tempobj.designationhead._id) {
                          return true;
                        } else {
                          return false;
                        }
                      }
                    });
                    this.posHeadUserList = [];

                    tempHeadUserList.forEach(ele4 => {
                      if (ele4.userid && this.userList.length > 0) {
                        let tempobjuser: any;
                        tempobjuser = this.userList.find(ele => ele._id == ele4.userid._id);
                        if (tempobjuser) {
                          this.posHeadUserList.push(tempobjuser);
                        }
                      }
                    });
                    if (this.posHeadUserList.length == 0 && this.isChannelHead == false) {
                      this.showNotification('top', 'right', 'Please select head user first ', 'danger');
                      return;
                    }
                  }
                }
              }
            }
          }
        }
    } else {
      this.showNotification('top', 'right', 'Please select sales channel head designation from sales channel ', 'danger');
      return;
    }

    this.saleschannelsObj.designationhead = salesDesId;
    if (this.userList.length > 0) {
      this.userListByDesignation = [];
      //this.userListByDesignation = this.userList.filter(ele => ele.designationid == salesDesId);
      this.userListByDesignation = this.userList.filter(ele => Object.prototype.toString.call(ele.designationid) == '[object Object]' ? (ele.designationid._id == salesDesId) : ele.designationid == salesDesId);
      this.userListByDesignation = JSON.parse(JSON.stringify(this.userListByDesignation));
      if (this.posHeadUserList.length == 1) {
        if (this.isChannelHead == false) {
          if (this.userListByDesignation.length > 0) {
            this.userListByDesignation.forEach(ele7 => {
              if (this.posHeadUserList[0] != undefined) {
                ele7.head = this.posHeadUserList[0]._id;
              }
            });
          }
        }
      }

      if (this.selectedSaleschannelteamDetail.channels != undefined && this.selectedSaleschannelteamDetail.channels.length > 0) {
        let tempArr: any[];
        tempArr = this.selectedSaleschannelteamDetail.channels;
        tempArr.forEach(ele => {
          if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
            if (ele.designationid._id == salesDesId) {
              if (this.userListByDesignation.length > 0) {
                this.userListByDesignation.forEach(ele6 => {
                  if (ele.userid != undefined && ele6._id == ele.userid._id) {
                    ele6.checked = true;

                    if (ele.head != undefined) {
                      ele6.head = ele.head._id;
                    }
                  }
                });
              }
            }
          } else {
            if (ele.designationid == salesDesId) {
              if (this.userListByDesignation.length > 0) {
                this.userListByDesignation.forEach(ele6 => {
                  if (ele.userid != undefined && ele6._id == ele.userid._id) {
                    ele6.checked = true;
                    if (ele.head != undefined) {
                      ele6.head = ele.head._id;
                    }
                  }
                });
              }
            }
          }
        });
      }
    }
    $("#saleschntmModal").click();
  }


  updateSalesChannelTeam() {
    if (this.selectedSaleschannelteamDetailToadd.channels != undefined && this.selectedSaleschannelteamDetailToadd.channels.length > 0) {
      let tempArr: any[];
      tempArr = this.selectedSaleschannelteamDetailToadd.channels;
      tempArr.forEach(ele => {
        this.userListByDesignation.forEach(ele6 => {
          if (Object.prototype.toString.call(ele6.designationid) == '[object Object]') {
            if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
              if (ele.designationid._id == ele6.designationid._id) {
                if (ele.userid._id == ele6._id) {
                  ele.head = ele6.head;
                }
              }
            } else {
              if (ele.designationid == ele6.designationid._id) {
                if (ele.userid._id == ele6._id) {
                  ele.head = ele6.head;
                }
              }
            }
          } else {
            if (Object.prototype.toString.call(ele.designationid) == '[object Object]') {
              if (ele.designationid._id == ele6.designationid) {
                if (ele.userid._id == ele6._id) {
                  ele.head = ele6.head;
                }
              }
            } else {
              if (ele.designationid == ele6.designationid) {
                if (ele.userid._id == ele6._id) {
                  ele.head = ele6.head;
                }
              }
            }
          }
        });
      });
    }

    if (this.selectedSaleschannelteamDetailToadd.saleschannelid != undefined) {
      if (Object.prototype.toString.call(this.selectedSaleschannelteamDetailToadd.saleschannelid) == '[object Object]') {
        this.selectedSaleschannelteamDetailToadd.saleschannelid = this.selectedSaleschannelteamDetailToadd.saleschannelid._id;
      }
    }
    this.btnDisable = true;
    this._saleschannelteamService
      .Update(this.selectedSaleschannelteamDetailToadd._id, this.selectedSaleschannelteamDetailToadd)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Sales channel team detail has been updated successfully!!!', 'success');
          // this.getAllsaleschannelTeamList();
          $('#closedesg').click();
          this.btnDisable = false;
          //emit data;
          setTimeout(() => {
            this.addedSalesChannel.emit(data);
          }, 200);
          this.clearSalesChannelTeamDesignationForm();
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
