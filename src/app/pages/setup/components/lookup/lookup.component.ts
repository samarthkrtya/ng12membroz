import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import {  Subject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { MatTableDataSource } from '@angular/material/table';

declare var $: any;
import swal from 'sweetalert2';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html'
})

export class LookupComponent extends BaseLiteComponemntComponent implements OnInit {
 
  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;
  
  lookupLists : any[]= [];
  lookupDetail : any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;

  displayedColumns: string[] = ['name', 'action'];

  filter = '';

  constructor(
    private _route: ActivatedRoute,
    private _commonService: CommonService,
  ) {
    super();

    this.form = new FormGroup({
      ind: new FormControl(),
      name: new FormControl('',Validators.required),
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'lookup';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

    
  async LoadData() { 
    if (this.bindId) {
      await this.getLookup(); 
      await this.setData(); 
    }
    this.isLoading = false;
  }


  
 async getLookup(){
  let postData = {};
  postData['search'] = [{ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" }];
  postData['search'] = [{ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" }];
    
  let url = '/lookups/filter';
  let method = 'POST';
  
  await this._commonService
    .commonServiceByUrlMethodDataAsync(url,method,postData)
      .then((data : any)=>{
        this.lookupDetail = data[0];
        this.lookupLists = [];
        this.lookupLists = data[0].data;
      });
  }

async setData(){
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.lookupLists);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
    return;
  }

  Cancel(){
    this.form.reset();
    this.submitted = false;
  }
 
  editAction(i: number , name : string){
    this.form.controls['ind'].setValue(i);
    this.form.controls['name'].setValue(name);
    $("#modalBtn").click();
  }

  deleteAction(i: number){
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to revert this !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'No',
      customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
  }).then(async(result) => {
      if (result.value) {
          this.lookupLists.splice(i,1);

          let url = '/lookups';
          let method = 'PATCH';

          var model = {};
          model['data'] = this.lookupLists;
          
          
          this.disableButton = true;
          await this._commonService
            .commonServiceByUrlMethodDataAsync(url,method,model, this.bindId)
              .then(async(data : any)=>{
                this.disableButton = false;
                super.showNotification("top", "right", `${this.capitalizeFirstLetter(this.lookupDetail?.lookup)} deleted successfully !!`, "success");
                this.form.reset();
                await this.LoadData();
              }).catch((e)=>{
                console.error("e",e);
                this.disableButton = false;
              });    
      }
  });

  
  }

  capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
   
  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    var operationStr : string = "";
    if(!valid) return;
    if(value['ind'] != null && value['ind'] >= 0 ){
      this.lookupLists.splice(value['ind'],1,{name : value['name'], code : value['name']})
      operationStr = "update";
    }else{
      this.lookupLists.push({name : value['name'], code : value['name'] });
      operationStr = "added";
    }
    let url = '/lookups';
    let method = 'PATCH';

    var model = {};
    model['data'] = this.lookupLists;
    
    
    this.disableButton = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url,method,model, this.bindId)
        .then(async(data : any)=>{
          this.disableButton = false;
          this.submitted = false;
          super.showNotification("top", "right", `${this.capitalizeFirstLetter(this.lookupDetail?.lookup)}  ${operationStr} successfully !!`, "success");
          $("#close").click();
          this.form.reset();
          await this.LoadData();
        }).catch((e)=>{
          console.error("e",e);
          this.disableButton = false;
          this.submitted = false;
          $("#close").click();
        });    
  }
 
 
 
}
