import { Pipe, PipeTransform } from "@angular/core";
@Pipe({ name: 'duplicate' })
export class DuplicatePipe implements PipeTransform {
  transform(elements: any[]) {
     let result = [];
     elements.forEach(element => {
      if (!elements.find(fEle => fEle.valueafterrmove === element.valueafterrmove)) {
        result.push(element);
      }
    });
  return result;
  }
}