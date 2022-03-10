import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
 
import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { CommonService } from '../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
import swal from 'sweetalert2';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ip-config',
  templateUrl: './ip-config.component.html',
  styles : [
    `
    .box{
        color : #826f6e
    }
    `
  ]
})

export class IPConfigComponent extends BaseLiteComponemntComponent implements OnInit {
 
  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource;

  displayedColumns: string[] = ['name','comment', 'action'];

  filter = '';

  ipList : any[] = [];
  organizationsetting : any;

  constructor(private _commonService : CommonService ) {
    super();

    this.form = new FormGroup({
      id: new FormControl(null),
      ip: new FormControl(null,Validators.required),
      comment: new FormControl(null),
    });
  }

  async ngOnInit() {
    await super.ngOnInit(); 
    this.organizationsetting = {...this._authService.currentUser.organizationsetting};
    if(this.organizationsetting.systemsecurity && this.organizationsetting.systemsecurity.ipinclusion && this.organizationsetting.systemsecurity.ipinclusion.length > 0){
      this.ipList =  [...this.organizationsetting.systemsecurity.ipinclusion];
      this.ipList.map((a,i)=> { a.id = i+1});
    }
    this.dataSource = new MatTableDataSource();
    this.dataSource = new MatTableDataSource(this.ipList);
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    });
    this.dataSource.sort = this.sort;
  }

  Cancel(){
    this.form.reset();
    this.submitted = false;
  }
 
  editAction(item){
    this.form.controls['id'].setValue(item.id);
    this.form.controls['ip'].setValue(item.ip);
    this.form.controls['comment'].setValue(item.comment);
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
            this.ipList.splice(i,1);
            this.ipList.map((a)=> {a.ip = a.ip , a.comment = a.comment})
            let url = 'organizationsettings';
            let method = 'PUT';

            var model = {};
            model = this.organizationsetting;
            if(!model['systemsecurity']) {
              model['systemsecurity'] = {};
              model['systemsecurity']['ipinclusion'] = [];
            }
            model['systemsecurity']['ipinclusion'] = this.ipList;
            
            this.disableButton = true;
            await this._commonService
              .commonServiceByUrlMethodDataAsync(url,method,model,this.organizationsetting._id)
                .then(async(data : any)=>{
                  this.updateGlobal()
                  let localStoragetmp = JSON.parse(localStorage.getItem('currentUser'));
                  localStoragetmp['organizationsetting'] = data;
                  localStorage.removeItem('currentUser');
                  localStorage.setItem('currentUser',JSON.stringify(localStoragetmp))
                  
                  this.disableButton = false;
                  super.showNotification("top", "right", `ip deleted successfully !!`, "success");
                  await this.ngOnInit();
                }).catch((e)=>{
                  this.disableButton = false;
                });    
              }
  });

  
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
    if(!valid) return;
    if(value.id && value.id > 0){
      this.ipList.splice(this.ipList.indexOf(a=>a.id == value.id), 1, {ip : value.ip , comment : value.comment});
    }else{
      this.ipList.push(value);
    }
    this.ipList.map((a)=> {a.ip = a.ip , a.comment = a.comment});
    let url = 'organizationsettings';
    let method = 'PUT';

    var model = {};
    model = this.organizationsetting;
    if(!model['systemsecurity']) {
      model['systemsecurity'] = {};
      model['systemsecurity']['ipinclusion'] = [];
    }
    model['systemsecurity']['ipinclusion'] = this.ipList;
   
    // console.log("model==>",model);
    this.disableButton = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url,method,model,this.organizationsetting._id)
        .then(async(data : any)=>{
          // console.log("data==>",data);
          this.updateGlobal()
          let localStoragetmp = JSON.parse(localStorage.getItem('currentUser'));
          localStoragetmp['organizationsetting'] = data;
          localStorage.removeItem('currentUser');
          localStorage.setItem('currentUser',JSON.stringify(localStoragetmp))
          
          this.disableButton = false;
          this.submitted = false;
          super.showNotification("top", "right", `ip updated successfully !!`, "success");
          $("#close").click();
          this.form.reset();
          await this.ngOnInit();
        }).catch((e)=>{
          console.error("e",e);
          this.disableButton = false;
          this.submitted = false;
          $("#close").click();
        });    
  }
 
  updateGlobal(){

    this._commonService
      .globalreset()
        .pipe(takeUntil(this.destroy$))
        .subscribe((data : any)=>{
          console.log("global is reseted");
        });
  }
 
 
}
