import { Component, EventEmitter, forwardRef, HostBinding, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-hosts-lists',
  templateUrl: './appointment-hosts-lists.component.html',
  styles: [
    `
      .example-full-width {
        width: 100%;
      }
    `
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppointmentHostsListsComponent),
      multi: true
    }
  ]
})
export class AppointmentHostsListsComponent implements OnInit, ControlValueAccessor {

  myControl = new FormControl();
  selectedValue;
  filteredOptions: Observable<string[]>;
  question = 'Would you like to add ';
  @Input() options: any[];
  @Input() dbvalue: any;
  @Input() index: any;
  @Output() notavailable = new EventEmitter();

  // Function to call when the option changes.
  onChange = (option: string) => {};

  // Function to call when the input is touched (when the autocomplete is clicked).
  onTouched = () => {};

  get value() {
    return this.selectedValue;
  }

  ngOnInit() {

    

    this.myControl.setValue(null);
    
    
    
    this.options = this.options.filter(item => !item.disable && item.status == "active");
    
    
    if(this.dbvalue) {
      var staffObj = this.options.find(p=>p._id == this.dbvalue);
      
      if(staffObj) {
        this.myControl.setValue(staffObj);
        
      }
    }
    

    this.filteredOptions = this.myControl.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.fullname),
        map(option => option ? this.filter(option) : this.options.slice())
      );

      
  }

  optionSelected(option) {
    console.log("option", option)
    this.myControl.setValue(option.value);
    this.writeValue(option.value);
    this.notavailable.emit(option.value);

  }

  enter() {
    const controlValue = this.myControl.value;
    if (!this.options.some(entry => entry === controlValue)) {
      this.notavailable.emit(controlValue);
      const index = this.options.push(controlValue);
      setTimeout(
        () => {
          this.myControl.setValue(controlValue);
          this.writeValue(controlValue);
        }
      );
    } else {
      this.writeValue(controlValue);
    }
  }

  handleEmptyInput(event: any) {
    if(event.target.value === '') {
      this.myControl.setValue("");
      this.writeValue("");
      this.notavailable.emit("");
    }
  }

  // Allows Angular to update the model (option).
  // Update the model and changes needed for the view here.
  writeValue(option: any): void {
    this.selectedValue = option;
    this.onChange(option);
  }

  // Allows Angular to register a function to call when the model (rating) changes.
  // Save the function as a property to call later here.
  registerOnChange(fn: (option: string) => void): void {
    this.onChange = fn;
  }

  // Allows Angular to register a function to call when the input has been touched.
  // Save the function as a property to call later here.
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.options
        .filter(option => {
          if(option['fullname']) {
            return option['fullname'].toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.options.slice();
    }
    return results;
  }

  displayFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

}