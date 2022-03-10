import { Component, OnInit, Input, ViewChild, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import swal from 'sweetalert2';

declare var $: any;
@Component({
  selector: 'app-giftcard-list',
  templateUrl: './giftcard-list.component.html'
})
export class GiftcardListComponent extends BaseLiteComponemntComponent implements OnInit ,OnChanges{

  @ViewChild('treechecklist', { static: false }) treechecklist: any;

  @Input() dataContent: any;
  @Input() giftcardList: any[];
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
    this.pagename = "app-giftcard-list";
  }
 
  async ngOnInit() {
    super.ngOnInit();
    
    this.giftcardList.map(a=>{a.item = a.itemname;a.fromdb = true});
    this.selectedAll = !!this.dataContent.property.allgiftcards;
    this.disableBtn = !!this.dataContent?.property?.applyonbill;
  }


  async ngOnChanges() { 
    if (this.updatePage && this.updatePage.includes('Giftcard')) {
      if(this.giftcardList.length > 0){
        this.giftcardList.map(a=> {
            if(a && a._id){
                a.item = a.itemname;
                a.fromdb = true;
            }
            });
         }
         this.selectedAll = !!this.dataContent.property.allgiftcards;
   }
 } 
  

  onClickPrdt() {
    this.treePostData = {};
    this.treePostData["search"] = [];
    this.treePostData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    this.treePostData["search"].push({ "searchfield": "categoryid", "searchvalue": "61dbbd1c521c4f132099f87e", "criteria": "eq" , "datatype" : "ObjectId" });

    this.isProductOpen = !this.isProductOpen;
  }

  onSelectTree(event: any[]) {
    if(event.length > 0){
      event.map(a => a.fromdb = false);
      if (event.length >= this.giftcardList.length) {
        event.forEach(prd => {
          var ind = this.giftcardList.findIndex(a => a._id == prd._id);
          if (prd.level > 0 && ind == -1) {
            this.giftcardList.push(prd);
          }
        });
      } else {
        this.giftcardList.forEach((prd, i) => {
          var ind = event.findIndex(a => a._id == prd._id);
          if (prd.level > 0) {
            if (ind != -1) {
              prd = event[ind];
            } else {
              this.giftcardList.splice(i, 1);
            }
          }
        });
      }
    }else{
      this.giftcardList = [];
    }
    let dataSource = this.giftcardList;
    let cloned = dataSource.slice();
    this.giftcardList = cloned;
    this.isProductOpen = !this.isProductOpen;
  }

 async onSaveTree() {
    this.treechecklist.onSave();
    $("#close_giftcards").click();
    await this.onSaveProduct();
  }

  
  async setAll(checked : boolean){
    this.giftcardList = [];
    try {
      var model = {};
      model = this.dataContent;
      model['giftcards'] = [];
      model['property']['allgiftcards'] = checked; 
      
      let url = "coupons/";
      let method = "PUT";
      this.disableBtn = true;
      this.isLoadingData = true;
        
      this._commonService
         .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
           .then((data)=>{
               super.showNotification("top", "right", "Giftcards updated successfully !!", "success");
               this.disableBtn = false;
               this.isLoadingData = false;
               this.submittedData.emit('success');
         });
      } catch (e) {
        this.disableBtn = false;
        this.isLoadingData = false;
      }
  }

  async onSaveProduct() {
    try {
    var model = {};
    model = this.dataContent;
    model['giftcards'] = this.dataContent['giftcards'];
    if (model['giftcards'] != []) {
      model['giftcards'] = [];
    }
    
    model['giftcards'] = [...this.giftcardList].map(a => a._id);
    model['property']['allgiftcards'] = false; 
    let url = "coupons/";
    let method = "PUT";
    this.disableBtn = true;
    this.isLoadingData = true;
    this._commonService
       .commonServiceByUrlMethodDataAsync(url , method , model, this.bindId)
         .then((data)=>{
             super.showNotification("top", "right", "Giftcard updated successfully !!", "success");
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
          var ind = this.giftcardList.findIndex(a => a._id == item._id);
          this.giftcardList.splice(ind, 1);

          var model = {};
          model = this.dataContent;
          model['giftcards'] = [];

          model['giftcards'] = [...this.giftcardList].map(a => a._id);

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
