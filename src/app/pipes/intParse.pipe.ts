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
    else if(typeof value === 'number'){
      return value.toLocaleString("es-ES",{maximumFractionDigits: 2, minimumFractionDigits: 0});
    }
    else{
      return value;
    }
  }
}

