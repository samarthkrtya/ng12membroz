import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';
declare var $: any;

@Component({
  selector: 'app-inspection-add-assets',
  templateUrl: './inspection-add-assets.component.html',
  styles: [
  ]
})
export class InspectionAddAssetsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  isLoading: boolean = false;
  assetLists: any [] = [];

  form: FormGroup;
  submitted: boolean;
  disableBtn: boolean = false;

  title: any;

   constructor(
    private _commonService: CommonService,
    private fb: FormBuilder,
    private router: Router,
  ) { 

    super()
    this.pagename="app-inspection-assets";

    this.form = fb.group({
      'title': [this.title, {
        validators: [
          Validators.required
        ], 
      }],
    });

  }

  @Input() dataContent: any;
  @Input() bindId: any;
  @Output() onInspectionAssetData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
      await this.getAllAssets()
    } catch(error) {
      console.error(error);
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.isLoading = true;
    this.disableBtn = false;
    this.assetLists = [];
    return;
  }

  async getAllAssets() {

    var url = "assets/filter"
    var method = "POST";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "customerid", "searchvalue": this.bindId, "criteria": "eq" });
    
    
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.assetLists = [];
          this.assetLists = data;
          this.isLoading = false;
          console.log("assetLists", this.assetLists)
          return;
        }
      }, (error) => {
        console.error(error);
        this.isLoading = false;
      });
  }

  onSubmit(value: any, isValid: boolean) {
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return false;
    } else {

      var url = "assets"
      var method = "POST";

      let postData = {};
      postData["title"] = value.title;
      postData["customerid"] = this.bindId;
      postData["onCustomerModel"] = "Member";
      
      return this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, postData)
        .then((data: any) => {
          if (data) {
            $("#closeAssets").click()
            this.showNotification('top', 'right', 'Asset has been Added Successfully!!!', 'success');
            setTimeout(() => {
              this.onInspectionAssetData.emit();  
            }, 2000);
            
            return;
          }
        }, (error) => {
          console.error(error);
        });

    }
  }

  editAsset(item: any) {
    console.log("item", item);
    this.router.navigate(['/pages/dynamic-forms/form/6119e76cdf4bcd2a04ecab1d/'+ item._id]);
  }

  deleteAsset(item: any) {
    

    const varTemp = this;

    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this action!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, Delete it!`,
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {

        let method = "PATCH";
        let url = "assets";

        var model = { 'status' : 'deleted' };

        return varTemp._commonService
          .commonServiceByUrlMethodDataAsync(url, method, model, item._id)
          .then((data: any) => {
            if (data) {
              this.showNotification('top', 'right', 'Asset has been Deleted Successfully!!!', 'success');
              setTimeout(() => {
                this.onInspectionAssetData.emit(); 
                varTemp.ngOnInit()  
              }, 1000);
              
              return;
            }
          }, (error) => {
            console.error(error);
          })
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

  btnClick= function () {
    this.router.navigate(['/pages/dynamic-forms/form/6119e76cdf4bcd2a04ecab1d']);
  }

}
