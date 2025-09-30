export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
}

export interface Person {
  id: string;
  name: string;
  color?: string;
}

export interface SplitResult {
  personId: string;
  personName: string;
  total: number;
  items: {
    itemName: string;
    itemPrice: number;
    splitPrice: number;
  }[];
}

export interface OCRResult {
  text: string;
  items: ReceiptItem[];
  storeName?: string;
  storeContext?: string;
}