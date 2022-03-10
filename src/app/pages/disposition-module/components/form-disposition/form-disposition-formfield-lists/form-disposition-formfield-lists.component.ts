import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../../core/services/common/common.service';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-form-disposition-formfield-lists',
  templateUrl: './form-disposition-formfield-lists.component.html',
  styles: [
  ]
})
export class FormDispositionFormfieldListsComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();
  @Input() dispositionModel: any;
  @Output() formfieldSubmitData: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(
    private _commonService: CommonService
  ) {
    super()
   }

   async ngOnInit() {
    try {
      await super.ngOnInit();
      await this.initializeVariables()
    } catch (error) {
      console.error(error)
    } finally {
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    return;
  }

  edit(item: any) {
    let obj = {
      action: "edit",
      data: item
    }
    this.formfieldSubmitData.emit(obj);
  }

  delete(item: any) {

    var Temp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this filed!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass:{
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        Temp.remove(item._id, Temp.dispositionModel.fields);
        setTimeout(() => {
          Temp.deletefields();  
        }, 500);
        
      } else {
        swal.fire({
          title: 'Cancelled',
          text: 'Your imaginary file is safe :)',
          icon: 'error',
          customClass:{
            confirmButton: "btn btn-info",
          },
          buttonsStyling: false
        });
      }
    })
  }

  remove(id: any, array: any) {

    for (const i in array) {
      if (array[i]._id == id) {
        array.splice(i, 1);
      }
    }
  }

  deletefields() {

    var url = "dispositions/" + this.dispositionModel._id;
    var method = "PUT";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, this.dispositionModel)
      .then( (data: any) => {
        if(data) {
          let obj = {
            action: "delete"
          }
          this.formfieldSubmitData.emit(obj);
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

}
