import {  Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})

export class CartComponent implements OnInit {

  @Input() quantity: number;
  @Input() itemId: number;
  @Output() cartClick: EventEmitter<any> = new EventEmitter<any>();

  inputName: string;
  ngOnInit() {
    this.inputName = this.itemId + '_rating';
  }
  onClick(quantity: number): void {
    console.log('rating component itemId >>>>>>>>>>', this.itemId);
    console.log('rating component rating >>>>>>>>>>', quantity);
    this.quantity = quantity;
    this.cartClick.emit({
      itemId: this.itemId,
      quantity: quantity
    });
  }

}