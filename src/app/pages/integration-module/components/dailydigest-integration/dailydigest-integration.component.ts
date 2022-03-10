import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import swal from 'sweetalert2';


@Component({
  selector: 'app-dailydigest-integration',
  templateUrl: './dailydigest-integration.component.html',
})
export class DailydigestIntegrationComponent extends BaseComponemntComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();


  Integrated: any[] = [];
  NotIntegrated: any[] = [];
  disableBtn: boolean = false;
  isLoading: boolean = false;




  constructor(
    private ref: ChangeDetectorRef

  ) { 
    super()
  }

  async ngOnInit(){
    try {
      this.isLoading = true;
      await super.ngOnInit();
      await this.initializeVariables();
      await this.getForms();
      this.isLoading = false;
    } catch (error) {
      console.error(error)
    } finally {
    }
  }
  
  ngAfterViewInit() {
    this.ref.detectChanges();
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  

  async initializeVariables() {
    this.Integrated = [];
    return;
  }

  async getForms() {
    var url = "forms/filter/view";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": "formtype", "searchvalue": "report", "criteria": "eq", "datatype": "text" });
    postData['search'].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId", "cond": "or" });
    postData['search'].push({ "searchfield": "branchid", "searchvalue": false, "criteria": "exists", "datatype": "boolean", "cond": "or" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          console.log(data);          
          this.Integrated = [];
          this.NotIntegrated = [];

          data.forEach((form: any) => {
            form.degnurl = '/pages/setup/form-fields/' + form.formname;
            form.configurl = '/pages/setup/form-fields/' + form.formname;
            if (form.formdata && form.formdata._id) {
              form.configurl = '/pages/integration-module/dailydigest-integration/dailyconfig/' + form._id + '/' + form.formdata._id;
              this.Integrated.push(form);
            } else {
              this.NotIntegrated.push(form);
            }
          });

        }
      })
  }

  
  onDelete(id: any) {
    const varTemp = this;
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
    }).then(async (result) => {
      if (result.value) {
        try {
          var url = "formdatas/";
          var method = "DELETE";
          varTemp.disableBtn = true;
          await varTemp._commonService
            .commonServiceByUrlMethodIdOrDataAsync(url, method, id)
            .then(async (data) => {
              if (data) {
                varTemp.showNotification('top', 'right', 'Configured integration deleted successfully !!', 'success');
                varTemp.disableBtn = false;
                await varTemp.ngOnInit()
              }
            });
        } catch (e) {
          varTemp.disableBtn = false;
          varTemp.showNotification('top', 'right', 'Error Occured !!', 'danger');
        }
      }
    });
  }

}
