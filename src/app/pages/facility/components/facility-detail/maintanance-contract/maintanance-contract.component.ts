import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormdataService } from 'src/app/core/services/formdata/formdata.service';
import { AssetService } from 'src/app/core/services/service/asset.service';
import { AssetsModel } from 'src/app/core/models/assets/assets.model';
import { FormdataModule } from 'src/app/pages/formdata/formdata.module';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-maintanance-contract',
  templateUrl: './maintanance-contract.component.html',
})
export class MaintananceContractComponent extends BaseComponemntComponent implements OnInit {

  @Input() bindId: any;
  @Input() dataContent: any;
  @Output() updateRecord = new EventEmitter();

  AssetsModel = new AssetsModel()
  maintanceform:FormGroup;
  isDisable:boolean = false;
  selectedcontract:any;
  vendorlists:any[] = [];
  selectedbrand:any;

  constructor(
    public fb:FormBuilder,
    private datePipe: DatePipe,
    private _assetService:AssetService

  ) { 
    super();
    this.maintanceform = this.fb.group({
      'brand':[''],
      'purchase':[''],
      'cost':[''],
      'depreciation':[''],
      'contractcost':[''],
      'startperiod':[''],
      'endperiod':[''],
      'contract':['']
    });

  }

  async ngOnInit() {
    super.ngOnInit();
    await this.getvendor();
  }

  onItemSelect(item:any){
    this.selectedcontract = item;
    console.log(item);
    
  }

  onItemSelect1(item:any){
    this.selectedbrand = item;
    console.log(item);
    
  }

  async getvendor()
  {
    var url = "vendors/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": 'active', "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.vendorlists = data;
          console.log(this.vendorlists);          
        }
      })
  }

  onSubmit(value:any)
  {
    this.isDisable = true;
    var start = this.datePipe.transform(new Date(this.maintanceform.get("startperiod").value),"yyyy-MM-dd hh:mm:ss");


    var url = "assets/" + this.bindId;
    var method = "PATCH";

    var postData = { property: {} };
    postData.property["brand"] = this.selectedbrand ? this.selectedbrand : 'null',
    postData.property["purchase"] = value.purchase ? value.purchase : 'null',
    postData.property["cost"] = value.cost ? value.cost :' null',
    postData.property["depreciation"] = value.depreciation ? value.depreciation : 'null',
    postData.property["contractcost"] = value.contractcost ? value.contractcost : 'null',
    postData.property["startperiod"] = start ? start : '',
    postData.property["contract"] = this.selectedcontract ? this.selectedcontract : 'yearly',
    
    console.log(postData);

  
    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.isDisable = false;
          this.showNotification('top', 'right', 'Contract Added successfullyy....!!!', 'success');
      }
      this.maintanceform.reset();

    })
 
    
  } 

  

}
