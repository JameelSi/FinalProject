import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prettyPrint'
})
export class PrettyPrintPipe implements PipeTransform {

  transform(value: string): string {
    return value.replace(/\n/g, '<br>')
  }

}
