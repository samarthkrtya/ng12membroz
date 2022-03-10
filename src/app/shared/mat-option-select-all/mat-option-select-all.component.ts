import { Component, OnInit, Host, AfterViewInit, OnDestroy } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MatPseudoCheckboxState } from '@angular/material/core';
import { ControlContainer, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-mat-option-select-all',
  templateUrl: './mat-option-select-all.component.html',
  styles: [`
    .mat-option {
      border-bottom: 1px solid #ccc;
      height: 3.5em;
      line-height: 3.5em;
  }
  ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
    border: 2px solid !important
  }`]
})
export class MatOptionSelectAllComponent implements OnInit, AfterViewInit, OnDestroy {

  state: MatPseudoCheckboxState = 'checked';

  private options = [];
  private value = [];

  private destroyed = new Subject(); 
  counter: number = 0;

  constructor(@Host() private matSelect: MatSelect) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    this.options = this.matSelect.options.map(x => x.value);
    this.matSelect.options.changes
      .pipe(takeUntil(this.destroyed))
      .subscribe(res => {
        this.options = this.matSelect.options.map(x => x.value);
        this.updateState();
      });

    this.value = this.matSelect.ngControl.control.value;
    this.matSelect.ngControl.valueChanges
      .pipe(takeUntil(this.destroyed))
      .subscribe(res => {
        this.value = res;
        this.updateState();
      });
    // ExpressionChangedAfterItHasBeenCheckedError fix...
    setTimeout(() => {
      this.updateState();
      
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  onSelectAllClick() {
    
    if (this.state === 'checked') {
      this.matSelect.ngControl.control.setValue([]);
    } else {
      this.matSelect.ngControl.control.setValue(this.options);
    }
    
  }

  private updateState() {
    const areAllSelected = this.areArraysEqual(this.value, this.options);
    
    if (areAllSelected) {
      this.state = 'checked';
    }
    else if (this.value.length > 0) {
      this.state = 'indeterminate'
    }
    else {
      this.state = 'unchecked';
    }

    
    if(this.options.length > 0 && this.counter == 0) {
      this.counter++;
      setTimeout(() => {
        this.onSelectAllClick()  
      });
      
    }
    
  }

    private areArraysEqual(a, b) {
      return [...a].sort().join(',') === [...b].sort().join(',');
    }

}
