import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SalesChannelService } from 'src/app/core/services/marketing/sales-channel.service';


import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
@Component({
  selector: 'app-sales-channel-hierarchy',
  templateUrl: './sales-channel-hierarchy.component.html',
  styleUrls: ['./sales-channel-hierarchy.component.css']
})
export class SaleChannelHierarchyComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() dataContent: any;
  @Output() addedSalesChannel: EventEmitter<any> = new EventEmitter<any>();

  salesDesignation: ISalesDesignation;

  saleschannelsObj: any = {};
  selectedSaleschannelDetailToadd: any = {};

  btnDisable: boolean = false;

  designationFields = {
    "fieldname": "designation",
    "fieldtype": "form",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "modelValue": "designation",
    "form": {
      "formfield": "_id",
      "displayvalue": "title",
      "apiurl": "designations/filter",
    },
    "sort" : "title",
    "dbvalue": ""
  }

  constructor(
    private _salesChannelService: SalesChannelService
  ) {
    super();
    this.pagename = "app-sales-channel-details";
  }

  async ngOnInit() {
    await super.ngOnInit();
    if (this.dataContent)
      this.setData();
  }

  setData() {
    this.selectedSaleschannelDetailToadd = JSON.parse(JSON.stringify(this.dataContent));
    let obj: ISalesDesignation = {
      designationid: this.dataContent.channelhead._id,
      name: this.dataContent.channelhead.title,
      designation: this.dataContent.channelhead.title,
      many: false,
      subordinates: []
    };
    if (this.dataContent.channels && this.dataContent.channels.length > 0) {
      this.procSalesChannelND(obj, this.dataContent.channels, this.dataContent.channelhead);
    }
    this.salesDesignation = obj;
    return;
  }

  procSalesChannelND(objSD: ISalesDesignation, subList: any, eleParent: any) {
    subList.forEach(ele99 => {
      if (ele99.designationhead && ele99.designationhead._id == eleParent._id) {
        let obj4: ISalesDesignation = {
          designationid: ele99.designation._id,
          name: ele99.designation.title,
          designation: ele99.designation.title,
          many: ele99.many,
          subordinates: []
        };
        this.procSalesChannelND(obj4, subList, ele99.designation);
        objSD.subordinates.push(obj4);
      } else {
        return;
      }
    });
  }

  addSalesDesignation(salesDesId: any) {
    this.saleschannelsObj.designationhead = salesDesId;
    $("#saleschndsgnModal").click();
  }


  clearSalesChannelDesignationForm() {
    this.saleschannelsObj.designation = '';
    this.saleschannelsObj.designationhead = '';
    this.saleschannelsObj.many = false;
  }

  inputModelChange(event: any) {
    this.saleschannelsObj.designation = event;
  }

  async updateSalesChannel() {
    
    if (!this.saleschannelsObj.designationhead || !this.saleschannelsObj.designation) {
      this.showNotification('top', 'right', 'Please select sales channel designation', 'danger');
      return;
    }
    if (this.saleschannelsObj.designation && this.saleschannelsObj.designationhead && this.saleschannelsObj.designation == this.saleschannelsObj.designationhead) {
      this.showNotification('top', 'right', 'Sales channel designation & Sales channel designation head cannot same', 'danger');
      return;
    }

    if (this.saleschannelsObj.designation && this.saleschannelsObj.designation._id) {
      this.saleschannelsObj.designation = this.saleschannelsObj.designation._id;
    }

    if (this.selectedSaleschannelDetailToadd.channelhead && this.selectedSaleschannelDetailToadd.channelhead._id) {
      this.selectedSaleschannelDetailToadd.channelhead = this.selectedSaleschannelDetailToadd.channelhead._id;
    }

    if (this.selectedSaleschannelDetailToadd.channels) {
      if (this.selectedSaleschannelDetailToadd.channels.length > 0) {
        this.selectedSaleschannelDetailToadd.channels.forEach(ele => {
          if (ele.designation && ele.designation._id) {
            ele.designation = ele.designation._id;
          }
          if (ele.designationhead && ele.designationhead._id) {
            ele.designationhead = ele.designationhead._id;
          }
        });
        let isExist = false;
        this.selectedSaleschannelDetailToadd.channels.forEach(ele => {
          if (ele.designation && this.saleschannelsObj.designation && ele.designation == this.saleschannelsObj.designation) {
            if (ele.designationhead && this.saleschannelsObj.designationhead && ele.designationhead == this.saleschannelsObj.designationhead) {
              isExist = true;
            }
          }
        });
        if (isExist) {
          this.showNotification('top', 'right', 'Sales channel designation already exists', 'danger');
          return;
        } else {
          this.btnDisable = true;
          this.selectedSaleschannelDetailToadd.channels.push(this.saleschannelsObj);
          await this._salesChannelService
            .AsyncUpdate(this.selectedSaleschannelDetailToadd._id, this.selectedSaleschannelDetailToadd)
            .then(data => {
              if (data) {
                this.showNotification('top', 'right', 'Sales channel detail updated successfully !!', 'success');
                this.btnDisable = false;
                $("#closedesg").click();
                setTimeout(() => {
                  this.addedSalesChannel.emit(data);
                }, 200);
              }
            });
        }
      } else {
        this.btnDisable = true;
        this.selectedSaleschannelDetailToadd.channels = [];
        this.selectedSaleschannelDetailToadd.channels = [this.saleschannelsObj];

        await this._salesChannelService
          .AsyncUpdate(this.selectedSaleschannelDetailToadd._id, this.selectedSaleschannelDetailToadd)
          .then(data => {
            if (data) {
              this.showNotification('top', 'right', 'Sales channel detail updated successfully !!', 'success');
              this.btnDisable = false;
              $("#closedesg").click();
              setTimeout(() => {
                this.addedSalesChannel.emit(data);
              }, 200);
            }
          });
      }
    }
  }
}


export interface ISalesDesignation {
  designationid: string;
  name: string;
  designation: string;
  many: boolean;
  subordinates: ISalesDesignation[];
}