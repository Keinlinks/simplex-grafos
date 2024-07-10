import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appIntParse',
  standalone: true,
})
export class IntParsePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    const containsLetters = /[a-zA-Z]/;
    if(typeof value === 'string' && !containsLetters.test(value)){
    return Number(value.split('.')[0]);
    }
    else{
      return value;
    }
  }
}

