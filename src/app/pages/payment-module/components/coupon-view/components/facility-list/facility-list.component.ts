import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-facility-list',
  templateUrl: './facility-list.component.html'
})
export class FacilityListComponent extends BaseLiteComponemntComponent implements OnInit ,OnChanges{

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  @Input() dataContent: any;
  @Input() assetList: any[];
  @Input() bindId: any;
  @Input() formName: any;
  @Input() updatePage : any[] = [];
  @Output() submittedData = new EventEmitter();

  treePostData: any;
  displayedColumns3: string[] = ['item', 'action'];
  isProductOpen: boolean = false;
  disableBtn: boolean = false;
  isLoadingData: boolean = false;
  selectedAll: boolean = false;

  constructor(
    private _commonService: CommonService,
  ) {
    super();
    this.pagename = "app-service-asset";
  }
 
  async ngOnInit() {
    super.ngOnInit();
    this.assetList.map(a=>{a.item = a.title;a.fromdb = true});
    this.selectedAll = !!this.dataContent?.property?.allassets;
    this.disableBtn = !!this.dataContent?.property?.applyonbill;
  }


  async ngOnChanges() {  
    if (this.updatePage && this.updatePage.includes('Asset')) {
      if(this.assetList.length > 0){
        this.assetList.map(a=> {
          if(a && a._id){
              a.item = a.title;
              a.fromdb = true;
          }
        });
      }
      this.selectedAll = !!this.dataContent?.property?.allassets;
   }
 } 
  

  onClickPrdt() {
    this.treePostData = {};
    this.treePostData["search"] = [];
    this.treePostData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    this.treePostData["search"].push({ "searchfield": "category", "searchvalue": "61cd402b53332318c84b5d58", "criteria": "eq" });

    this.isProductOpen = !this.isProductOpen;
  }

  onSelectTree(event: any[]) {
    if(event.length > 0){
      event.map(a => a.fromdb = false);
      if (event.length >= this.assetList.length) {
        event.forEach(prd => {
          var ind = this.assetList.findIndex(a => a._id == prd._id);
          if (prd.level > 0 && ind == -1) {
            this.assetList.push(prd);
          }
        });
      } else {
        this.assetList.forEach((prd, i) => {
          var ind = event.findIndex(a => a._id == prd._id);
          if (prd.level > 0) {
            if (ind != -1) {
              prd = event[ind];
            } else {
              this.assetList.splice(i, 1);
            }
          }
        });
      }
    }else{
      this.assetList = [];
    }
    let dataSource = this.assetList;
    let cloned = dataSource.slice();
    this.assetList = cloned;
    this.isProductOpen = !this.isProductOpen;
  }

  async setAll(checked : boolean){
    this.assetList = []; 
    try {
      var model = {};
      model = this.dataContent;
      model['assets'] = [];
      model['property']['allassets'] = checked; 
      
      let url = "coupons/";
      let method = "PUT";
      this.disableBtn = true;
      this.isLoadingData = true;
      this._commonService
         .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
           .then((data)=>{
               super.showNotification("top", "right", "Facility updated successfully !!", "success");
               this.disableBtn = false;
               this.isLoadingData = false;
               this.submittedData.emit('success');
         });
      } catch (e) {
        console.log("e",e)
        this.disableBtn = false;
      }
  }
 

 async onSaveTree() {
    this.treechecklist.onSave();
    $("#close_" + this.treechecklist.for).click();
    await this.onSaveProduct();
  }

  async onSaveProduct() {
    try {
      var model = {};
      model = this.dataContent;
    
      if (model['assets'] != []) {
        model['assets'] = [];
      }
    
      model['assets'] = [...this.assetList].map(a => a._id);
      model['property']['allassets'] = false;

      let url = "coupons/";
      let method = "PUT";
      this.disableBtn = true;
      this.isLoadingData = true;
      this._commonService
        .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
          .then((data)=>{
              super.showNotification("top", "right", "Facility updated successfully !!", "success");
              this.disableBtn = false;
              this.isLoadingData = false;
              this.submittedData.emit('success');
          });
    } catch (e) {
      console.log("e",e)
      this.disableBtn = false;
      this.isLoadingData = false;
    }
  }

  async onDelete(item: any) {
    const varTemp = this;
    swal.fire({
      title: 'Are you sure to Delete?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes,Delete it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        try {
          var ind = this.assetList.findIndex(a => a._id == item._id);
          this.assetList.splice(ind, 1);

          var model = {};
          model = this.dataContent;
          model['assets'] = [];

          model['assets'] = [...this.assetList].map(a => a._id);

          let url = "coupons/";
          let method = "PUT";

          this.disableBtn = true;
          this.isLoadingData = true;
          this._commonService
            .commonServiceByUrlMethodDataAsync(url, method, model, this.bindId)
            .then((data) => {
              super.showNotification("top", "right", "Record deleted successfully !!", "success");
              this.disableBtn = false;
              this.isLoadingData = false;
              this.submittedData.emit('success');
            });
        } catch (e) {
          this.disableBtn = false;
          this.isLoadingData = false;
        }
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your event is safe :)',
          icon: 'error',
          customClass: {
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })

  }

}
